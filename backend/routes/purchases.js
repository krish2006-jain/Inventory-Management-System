import express from "express";
import Product from "../models/Product.js";
import Purchase from "../models/Purchase.js";
import StockMovement from "../models/StockMovement.js";
import Supplier from "../models/Supplier.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

const normalizeItems = (items = []) =>
  items.map((item) => ({
    product: item.product || item.productId,
    quantity: Number(item.quantity),
    unitCost: Number(item.unitCost),
  }));

const validateItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "At least one item is required";
  }

  for (const item of items) {
    if (
      !item.product ||
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0
    ) {
      return "Each item must contain a valid product and quantity";
    }

    if (!Number.isFinite(item.unitCost) || item.unitCost < 0) {
      return "Each item must contain a valid unitCost";
    }

    const exists = await Product.exists({ _id: item.product });
    if (!exists) {
      return "One or more selected products no longer exist";
    }
  }

  return null;
};

const receivePurchaseItems = async (purchase, userId, tenantId) => {
  for (const line of purchase.items) {
    const product = await Product.findOne({ _id: line.product, tenantId });
    if (!product) continue;

    const previousStock = product.stock;
    const newStock = previousStock + line.quantity;

    product.stock = newStock;
    await product.save();

    await StockMovement.create({
      product: product._id,
      type: "receive",
      direction: "in",
      quantity: line.quantity,
      previousStock,
      newStock,
      reason: "Purchase received",
      reference: purchase.poNumber,
      performedBy: userId,
      tenantId,
    });
  }
};

router.use(protect);

router.get("/", authorize("owner", "stockmgr"), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { tenantId: req.user.tenantId };
    if (status) filter.status = status;

    const purchases = await Purchase.find(filter)
      .populate("supplier", "name category")
      .populate("items.product", "name sku")
      .sort({ createdAt: -1 });

    // Calculate totalCost virtual for frontend
    const result = purchases.map((po) => {
      const obj = po.toObject();
      obj.totalCost = obj.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
      return obj;
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to load purchase orders" });
  }
});

router.post("/", authorize("owner", "stockmgr"), async (req, res) => {
  try {
    const { supplier, items, notes, poNumber, supplierId, status, expectedDate } = req.body;

    const supplierRef = supplier || supplierId;

    // Auto-generate PO number if not provided
    const poNum = poNumber || `PO-${Date.now().toString().slice(-8)}`;

    const normalizedItems = normalizeItems(items);
    const itemValidationError = await validateItems(normalizedItems);
    if (itemValidationError) {
      return res.status(400).json({ message: itemValidationError });
    }

    const totalAmount = normalizedItems.reduce(
      (sum, line) => sum + line.quantity * line.unitCost, 0
    );

    const purchase = await Purchase.create({
      poNumber: poNum,
      supplier: supplierRef || null,
      items: normalizedItems,
      totalAmount,
      status: status || "Pending",
      expectedDate: expectedDate || null,
      receivedDate: status === "Received" ? new Date() : null,
      notes: notes || "",
      createdBy: req.user._id,
      tenantId: req.user.tenantId,
    });

    if (purchase.status === "Received") {
      await receivePurchaseItems(purchase, req.user._id, req.user.tenantId);
    }

    const populated = await Purchase.findById(purchase._id)
      .populate("supplier", "name category")
      .populate("items.product", "name sku");

    res.status(201).json(populated);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "PO number already exists" });
    }
    res.status(500).json({ message: "Failed to create purchase order" });
  }
});

// Mark purchase as received (auto-update stock)
router.patch("/:id/receive", authorize("owner", "stockmgr"), async (req, res) => {
  try {
    const purchase = await Purchase.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!purchase) return res.status(404).json({ message: "Purchase order not found" });

    if (purchase.status === "Received") {
      return res.status(400).json({ message: "Already received" });
    }

    purchase.status = "Received";
    purchase.receivedDate = new Date();
    await purchase.save();

    await receivePurchaseItems(purchase, req.user._id, req.user.tenantId);

    const populated = await Purchase.findById(purchase._id)
      .populate("supplier", "name category")
      .populate("items.product", "name sku");

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to receive purchase order" });
  }
});

router.patch("/:id/status", authorize("owner", "stockmgr"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "In Transit", "Received", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid purchase status" });
    }

    const purchase = await Purchase.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!purchase) return res.status(404).json({ message: "Purchase order not found" });

    const wasReceived = purchase.status === "Received";
    purchase.status = status;

    if (status === "Received" && !wasReceived) {
      purchase.receivedDate = new Date();
      await purchase.save();
      await receivePurchaseItems(purchase, req.user._id, req.user.tenantId);
    } else {
      await purchase.save();
    }

    const populated = await Purchase.findById(purchase._id)
      .populate("supplier", "name category")
      .populate("items.product", "name sku");

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update purchase status" });
  }
});

export default router;

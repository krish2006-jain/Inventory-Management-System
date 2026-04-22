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

const receivePurchaseItems = async (purchase, userId) => {
  for (const line of purchase.items) {
    const product = await Product.findById(line.product);
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
    });
  }
};

router.use(protect);

router.get("/", authorize("owner", "stockmgr"), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const purchases = await Purchase.find(filter)
      .populate("supplier", "name category")
      .populate("items.product", "name sku")
      .sort({ createdAt: -1 });

    const summary = purchases.reduce(
      (acc, po) => {
        acc.totalSpending += po.totalAmount;
        if (po.status === "Pending" || po.status === "In Transit") {
          acc.activePOs += 1;
        }
        if (po.status === "Received") {
          acc.receivedCount += 1;
        }
        return acc;
      },
      { totalSpending: 0, activePOs: 0, receivedCount: 0 },
    );

    res.status(200).json({ purchases, summary });
  } catch (error) {
    res.status(500).json({ message: "Failed to load purchase orders" });
  }
});

router.post("/", authorize("owner", "stockmgr"), async (req, res) => {
  try {
    const { poNumber, supplierId, items, status, expectedDate } = req.body;

    if (!poNumber || !supplierId) {
      return res
        .status(400)
        .json({ message: "poNumber and supplierId are required" });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(400).json({ message: "Supplier not found" });
    }

    const normalizedItems = normalizeItems(items);
    const itemValidationError = await validateItems(normalizedItems);
    if (itemValidationError) {
      return res.status(400).json({ message: itemValidationError });
    }

    const totalAmount = normalizedItems.reduce(
      (sum, line) => sum + line.quantity * line.unitCost,
      0,
    );

    const purchase = await Purchase.create({
      poNumber,
      supplier: supplier._id,
      items: normalizedItems,
      totalAmount,
      status: status || "Pending",
      expectedDate: expectedDate || null,
      receivedDate: status === "Received" ? new Date() : null,
      createdBy: req.user._id,
    });

    if (purchase.status === "Received") {
      await receivePurchaseItems(purchase, req.user._id);
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

router.patch(
  "/:id/status",
  authorize("owner", "stockmgr"),
  async (req, res) => {
    try {
      const { status } = req.body;

      if (
        !["Pending", "In Transit", "Received", "Cancelled"].includes(status)
      ) {
        return res.status(400).json({ message: "Invalid purchase status" });
      }

      const purchase = await Purchase.findById(req.params.id);
      if (!purchase) {
        return res.status(404).json({ message: "Purchase order not found" });
      }

      const wasReceived = purchase.status === "Received";
      purchase.status = status;

      if (status === "Received" && !wasReceived) {
        purchase.receivedDate = new Date();
        await purchase.save();
        await receivePurchaseItems(purchase, req.user._id);
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
  },
);

export default router;

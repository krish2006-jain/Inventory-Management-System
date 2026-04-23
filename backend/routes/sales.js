import express from "express";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Create a sale (cashier or owner)
router.post("/", protect, authorize("cashier", "owner"), async (req, res) => {
  try {
    const { items, subtotal, discountType, discountValue, discountAmount, taxRate, taxLabel, taxAmount, total, paymentMethod, amountTendered, changeDue } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    // Generate sale ID
    const count = await Sale.countDocuments();
    const saleId = `SALE-${String(count + 1).padStart(5, "0")}`;

    // Deduct stock for each item
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }

      const prevStock = product.stock;
      product.stock -= item.quantity;
      await product.save();

      // Log stock movement
      await StockMovement.create({
        product: product._id,
        type: "dispatch",
        direction: "out",
        quantity: item.quantity,
        previousStock: prevStock,
        newStock: product.stock,
        reason: "Sale",
        reference: saleId,
        performedBy: req.user._id,
      });
    }

    const sale = await Sale.create({
      saleId,
      items,
      subtotal,
      discountType: discountType || "none",
      discountValue: discountValue || 0,
      discountAmount: discountAmount || 0,
      taxRate: taxRate || 0,
      taxLabel: taxLabel || "GST",
      taxAmount: taxAmount || 0,
      total,
      paymentMethod,
      amountTendered: amountTendered || 0,
      changeDue: changeDue || 0,
      cashier: req.user._id,
      cashierName: req.user.username,
    });

    res.status(201).json(sale);
  } catch (error) {
    console.log("Sale error:", error);
    res.status(500).json({ message: "Failed to complete sale" });
  }
});

// Get today's sales for current cashier
router.get("/today", protect, authorize("cashier", "owner"), async (req, res) => {
  try {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);

    const filter = { createdAt: { $gte: dayStart } };
    // Cashiers see only their own sales
    if (req.user.role === "cashier") {
      filter.cashier = req.user._id;
    }

    const sales = await Sale.find(filter).sort({ createdAt: -1 });

    const summary = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, s) => sum + s.total, 0),
      cashTotal: sales.filter((s) => s.paymentMethod === "cash").reduce((sum, s) => sum + s.total, 0),
      cardTotal: sales.filter((s) => s.paymentMethod === "card").reduce((sum, s) => sum + s.total, 0),
      upiTotal: sales.filter((s) => s.paymentMethod === "upi").reduce((sum, s) => sum + s.total, 0),
    };

    res.status(200).json({ sales, summary });
  } catch (error) {
    res.status(500).json({ message: "Failed to load sales" });
  }
});

// Get all sales (owner only, for reports)
router.get("/", protect, authorize("owner"), async (req, res) => {
  try {
    const { from, to, limit } = req.query;
    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const sales = await Sale.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 500);
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: "Failed to load sales" });
  }
});

export default router;

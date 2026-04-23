import express from "express";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import Supplier from "../models/Supplier.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

const getProductStatus = (stock, reorderLevel) => {
  if (stock <= 0) return "Out of Stock";
  if (stock <= reorderLevel) return "Low Stock";
  return "In Stock";
};

// SECURITY: Strip costPrice and profitMargin for non-owner roles
// This ensures financial data NEVER reaches the client for unauthorized users
const normalizeProduct = (productDoc, userRole = "owner") => {
  const product = productDoc.toJSON ? productDoc.toJSON() : productDoc.toObject();
  const result = {
    ...product,
    status: getProductStatus(product.stock, product.reorderLevel),
  };

  // Only owner can see cost price and profit margin
  if (userRole !== "owner") {
    delete result.costPrice;
    delete result.profitMargin;
  }

  return result;
};

const applyStockOperation = async ({
  productId,
  type,
  direction,
  quantity,
  reason,
  note,
  reference,
  userId,
  tenantId,
}) => {
  const product = await Product.findOne({ _id: productId, tenantId });
  if (!product) {
    const notFoundError = new Error("Product not found");
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  const parsedQty = Number(quantity);
  if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
    const validationError = new Error("Quantity must be greater than 0");
    validationError.statusCode = 400;
    throw validationError;
  }

  const previousStock = product.stock;
  let newStock = previousStock;

  if (direction === "in") {
    newStock = previousStock + parsedQty;
  } else {
    if (parsedQty > previousStock) {
      const stockError = new Error("Insufficient stock for this operation");
      stockError.statusCode = 400;
      throw stockError;
    }
    newStock = previousStock - parsedQty;
  }

  product.stock = newStock;
  await product.save();

  const movement = await StockMovement.create({
    product: product._id,
    type,
    direction,
    quantity: parsedQty,
    previousStock,
    newStock,
    reason: reason || "",
    note: note || "",
    reference: reference || "",
    performedBy: userId,
    tenantId,
  });

  const updatedProduct = await Product.findById(product._id)
    .populate("category", "name")
    .populate("supplier", "name");

  const populatedMovement = await StockMovement.findById(movement._id)
    .populate("product", "name sku")
    .populate("performedBy", "username role");

  return {
    product: normalizeProduct(updatedProduct),
    movement: populatedMovement,
  };
};

router.use(protect);

// Low stock products (for stock alerts page)
router.get("/low-stock", async (req, res) => {
  try {
    const products = await Product.find({ tenantId: req.user.tenantId })
      .populate("category", "name")
      .populate("supplier", "name");

    const lowStock = products
      .map((p) => normalizeProduct(p, req.user.role))
      .filter((p) => p.stock <= p.reorderLevel);

    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch low stock" });
  }
});

// Barcode lookup
router.get("/barcode/:sku", async (req, res) => {
  try {
    const product = await Product.findOne({
      sku: req.params.sku.toUpperCase(),
      tenantId: req.user.tenantId,
    })
      .populate("category", "name")
      .populate("supplier", "name");

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(normalizeProduct(product, req.user.role));
  } catch (error) {
    res.status(500).json({ message: "Failed to find product" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { search, category, supplier, status } = req.query;
    const filter = { tenantId: req.user.tenantId };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }

    if (supplier && mongoose.Types.ObjectId.isValid(supplier)) {
      filter.supplier = supplier;
    }

    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("supplier", "name")
      .sort({ updatedAt: -1 });

    let normalized = products.map((p) => normalizeProduct(p, req.user.role));

    if (status) {
      const statusKey = String(status).toLowerCase();
      normalized = normalized.filter((p) => {
        const key = p.status.toLowerCase().replace(/\s+/g, "-");
        return key === statusKey;
      });
    }

    res.status(200).json(normalized);
  } catch (error) {
    res.status(500).json({ message: "Failed to load products" });
  }
});

router.get("/low-stock", async (req, res) => {
  try {
    const products = await Product.find({
      tenantId: req.user.tenantId,
      $expr: { $lte: ["$stock", "$reorderLevel"] },
    })
      .populate("category", "name")
      .populate("supplier", "name")
      .sort({ stock: 1, updatedAt: -1 });

    res.status(200).json(products.map((p) => normalizeProduct(p, req.user.role)));
  } catch (error) {
    res.status(500).json({ message: "Failed to load stock alerts" });
  }
});

router.get("/movements", async (req, res) => {
  try {
    const { productId, limit = 50 } = req.query;
    const filter = { tenantId: req.user.tenantId };

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      filter.product = productId;
    }

    const movements = await StockMovement.find(filter)
      .populate("product", "name sku")
      .populate("performedBy", "username role")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 50, 200));

    res.status(200).json(movements);
  } catch (error) {
    res.status(500).json({ message: "Failed to load activity log" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    })
      .populate("category", "name")
      .populate("supplier", "name email phone");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const movements = await StockMovement.find({ product: product._id })
      .populate("performedBy", "username role")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      ...normalizeProduct(product, req.user.role),
      movements,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load product details" });
  }
});

router.post("/", authorize("owner", "stockmgr"), async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      supplier,
      unitPrice,
      costPrice,
      stock,
      reorderLevel,
      unit,
      location,
    } = req.body;

    if (!name || !sku || !category || unitPrice === undefined) {
      return res.status(400).json({
        message: "name, sku, category and unitPrice are required",
      });
    }

    const categoryExists = await Category.exists({ _id: category, tenantId: req.user.tenantId });
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category" });
    }

    if (supplier) {
      const supplierExists = await Supplier.exists({ _id: supplier, tenantId: req.user.tenantId });
      if (!supplierExists) {
        return res.status(400).json({ message: "Invalid supplier" });
      }
    }

    const product = await Product.create({
      name,
      sku,
      description,
      category,
      supplier: supplier || null,
      unitPrice,
      costPrice: costPrice || 0,
      stock: stock ?? 0,
      reorderLevel: reorderLevel ?? 10,
      unit,
      location,
      createdBy: req.user._id,
      tenantId: req.user.tenantId,
    });

    const populated = await Product.findById(product._id)
      .populate("category", "name")
      .populate("supplier", "name");

    res.status(201).json(normalizeProduct(populated, req.user.role));
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "SKU already exists" });
    }
    res.status(500).json({ message: "Failed to create product" });
  }
});

router.put("/:id", authorize("owner", "stockmgr"), async (req, res) => {
  try {
    const updates = {};
    const allowedKeys = [
      "name",
      "sku",
      "description",
      "category",
      "supplier",
      "unitPrice",
      "costPrice",
      "reorderLevel",
      "unit",
      "location",
    ];

    allowedKeys.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    if (updates.category) {
      const categoryExists = await Category.exists({ _id: updates.category, tenantId: req.user.tenantId });
      if (!categoryExists) {
        return res.status(400).json({ message: "Invalid category" });
      }
    }

    if (updates.supplier) {
      const supplierExists = await Supplier.exists({ _id: updates.supplier, tenantId: req.user.tenantId });
      if (!supplierExists) {
        return res.status(400).json({ message: "Invalid supplier" });
      }
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      updates,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("category", "name")
      .populate("supplier", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(normalizeProduct(product, req.user.role));
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "SKU already exists" });
    }
    res.status(500).json({ message: "Failed to update product" });
  }
});

router.delete("/:id", authorize("owner"), async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    await StockMovement.deleteMany({ product: deleted._id });

    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

router.post(
  "/:id/receive",
  authorize("owner", "stockmgr"),
  async (req, res) => {
    try {
      const { quantity, reason, note, reference } = req.body;
      const result = await applyStockOperation({
        productId: req.params.id,
        type: "receive",
        direction: "in",
        quantity,
        reason: reason || "Manual stock receive",
        note,
        reference,
        userId: req.user._id,
        tenantId: req.user.tenantId,
      });

      res.status(200).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res
        .status(statusCode)
        .json({ message: error.message || "Failed to receive stock" });
    }
  },
);

router.post(
  "/:id/dispatch",
  authorize("owner", "stockmgr", "cashier"),
  async (req, res) => {
    try {
      const { quantity, reason, note, reference } = req.body;
      const result = await applyStockOperation({
        productId: req.params.id,
        type: "dispatch",
        direction: "out",
        quantity,
        reason: reason || "Manual dispatch",
        note,
        reference,
        userId: req.user._id,
        tenantId: req.user.tenantId,
      });

      res.status(200).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res
        .status(statusCode)
        .json({ message: error.message || "Failed to dispatch stock" });
    }
  },
);

router.post("/:id/adjust", authorize("owner", "stockmgr"), async (req, res) => {
  try {
    const { quantity, direction, reason, note, reference } = req.body;

    if (!["in", "out"].includes(direction)) {
      return res
        .status(400)
        .json({ message: "direction must be 'in' or 'out'" });
    }

    const result = await applyStockOperation({
      productId: req.params.id,
      type: "adjustment",
      direction,
      quantity,
      reason: reason || "Manual adjustment",
      note,
      reference,
      userId: req.user._id,
      tenantId: req.user.tenantId,
    });

    res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res
      .status(statusCode)
      .json({ message: error.message || "Failed to adjust stock" });
  }
});

export default router;

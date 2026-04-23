import express from "express";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeSupplierInput = (payload = {}) => {
  const normalized = {};

  if (payload.name !== undefined) {
    normalized.name = String(payload.name || "").trim();
  }
  if (payload.email !== undefined) {
    const email = String(payload.email || "")
      .trim()
      .toLowerCase();
    normalized.email = email || null;
  }
  if (payload.phone !== undefined) {
    const phone = String(payload.phone || "").trim();
    normalized.phone = phone || null;
  }
  if (payload.category !== undefined) {
    const category = String(payload.category || "").trim();
    normalized.category = category || "General";
  }
  if (payload.address !== undefined) {
    normalized.address = String(payload.address || "").trim();
  }
  if (payload.rating !== undefined) {
    normalized.rating = Number(payload.rating);
  }

  return normalized;
};

router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const searchRegex = search ? new RegExp(escapeRegex(search), "i") : null;

    const pipeline = [];
    if (searchRegex) {
      pipeline.push({
        $match: {
          $or: [
            { name: searchRegex },
            { category: searchRegex },
            { email: searchRegex },
          ],
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "products",
          let: { supplierId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$supplier", "$$supplierId"] } } },
            { $count: "count" },
          ],
          as: "productStats",
        },
      },
      {
        $addFields: {
          productCount: {
            $ifNull: [{ $arrayElemAt: ["$productStats.count", 0] }, 0],
          },
        },
      },
      { $project: { productStats: 0 } },
      { $sort: { createdAt: -1 } },
    );

    const suppliers = await Supplier.aggregate(pipeline);
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Failed to load suppliers" });
  }
});

router.post("/", authorize("owner"), async (req, res) => {
  try {
    const normalized = normalizeSupplierInput(req.body);

    if (!normalized.name) {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    const supplier = await Supplier.create({
      ...normalized,
      createdBy: req.user._id,
    });

    res.status(201).json({ ...supplier.toObject(), productCount: 0 });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Supplier already exists" });
    }
    res.status(500).json({ message: "Failed to create supplier" });
  }
});

router.put("/:id", authorize("owner"), async (req, res) => {
  try {
    const updates = normalizeSupplierInput(req.body);

    if (updates.name !== undefined && !updates.name) {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    const supplier = await Supplier.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const productCount = await Product.countDocuments({
      supplier: supplier._id,
    });

    res.status(200).json({ ...supplier.toObject(), productCount });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Supplier already exists" });
    }
    res.status(500).json({ message: "Failed to update supplier" });
  }
});

router.delete("/:id", authorize("owner"), async (req, res) => {
  try {
    const productLinked = await Product.exists({ supplier: req.params.id });
    if (productLinked) {
      return res.status(400).json({
        message: "Cannot delete supplier while products are linked",
      });
    }

    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json({ message: "Supplier deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete supplier" });
  }
});

export default router;

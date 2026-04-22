import express from "express";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });

    const enriched = await Promise.all(
      suppliers.map(async (supplier) => {
        const productCount = await Product.countDocuments({
          supplier: supplier._id,
        });
        return {
          ...supplier.toObject(),
          productCount,
        };
      }),
    );

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Failed to load suppliers" });
  }
});

router.post("/", authorize("owner"), async (req, res) => {
  try {
    const { name, email, phone, category, address, rating } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    const supplier = await Supplier.create({
      name: name.trim(),
      email,
      phone,
      category,
      address,
      rating,
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
    const updates = {};
    const allowedKeys = [
      "name",
      "email",
      "phone",
      "category",
      "address",
      "rating",
    ];

    allowedKeys.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

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

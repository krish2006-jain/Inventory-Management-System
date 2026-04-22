import express from "express";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category._id,
        });
        return {
          ...category.toObject(),
          productCount,
        };
      }),
    );

    res.status(200).json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ message: "Failed to load categories" });
  }
});

router.post("/", authorize("owner", "stockmgr"), async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      color,
      icon,
      createdBy: req.user._id,
    });

    res.status(201).json({ ...category.toObject(), productCount: 0 });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: "Failed to create category" });
  }
});

router.put("/:id", authorize("owner", "stockmgr"), async (req, res) => {
  try {
    const updates = {};
    const allowedKeys = ["name", "description", "color", "icon"];

    allowedKeys.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    const category = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const productCount = await Product.countDocuments({
      category: category._id,
    });

    res.status(200).json({ ...category.toObject(), productCount });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: "Failed to update category" });
  }
});

router.delete("/:id", authorize("owner"), async (req, res) => {
  try {
    const inUse = await Product.exists({ category: req.params.id });
    if (inUse) {
      return res.status(400).json({
        message: "Cannot delete category while products are linked to it",
      });
    }

    const deleted = await Category.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category" });
  }
});

export default router;

import express from "express";
import StockMovement from "../models/StockMovement.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// GET all stock movements (for Activity Log)
router.get("/", async (req, res) => {
  try {
    const { product, type, date, limit } = req.query;
    const filter = {};

    if (product) filter.product = product;
    if (type) filter.type = type;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    const movements = await StockMovement.find(filter)
      .populate("product", "name sku")
      .populate("performedBy", "username role")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 200);

    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: "Failed to load stock movements" });
  }
});

export default router;

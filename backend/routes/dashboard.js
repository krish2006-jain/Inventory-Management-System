import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Supplier from "../models/Supplier.js";
import User from "../models/User.js";
import StockMovement from "../models/StockMovement.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/summary",
  protect,
  authorize("owner", "stockmgr"),
  async (req, res) => {
    try {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);

      const [
        totalProducts,
        totalCategories,
        totalSuppliers,
        lowStockItems,
        outOfStockCount,
        totalUsers,
        receivedToday,
        dispatchedToday,
        adjustedToday,
        recentMovements,
      ] = await Promise.all([
        Product.countDocuments(),
        Category.countDocuments(),
        Supplier.countDocuments(),
        Product.find({ $expr: { $lte: ["$stock", "$reorderLevel"] } })
          .sort({ stock: 1, updatedAt: -1 })
          .limit(6)
          .select("name sku stock reorderLevel"),
        Product.countDocuments({ stock: 0 }),
        User.countDocuments(),
        StockMovement.countDocuments({
          type: "receive",
          createdAt: { $gte: dayStart },
        }),
        StockMovement.countDocuments({
          type: "dispatch",
          createdAt: { $gte: dayStart },
        }),
        StockMovement.countDocuments({
          type: "adjustment",
          createdAt: { $gte: dayStart },
        }),
        StockMovement.find()
          .populate("product", "name sku")
          .populate("performedBy", "username role")
          .sort({ createdAt: -1 })
          .limit(8),
      ]);

      res.status(200).json({
        metrics: {
          totalProducts,
          totalCategories,
          totalSuppliers,
          totalUsers: req.user.role === "owner" ? totalUsers : undefined,
          lowStockCount: lowStockItems.length,
          outOfStockCount,
          receivedToday,
          dispatchedToday,
          adjustedToday,
        },
        lowStockItems,
        recentMovements,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to load dashboard summary" });
    }
  },
);

export default router;

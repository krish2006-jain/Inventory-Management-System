import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import StockMovement from "../models/StockMovement.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// Main dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const [totalProducts, totalCategories, products] = await Promise.all([
      Product.countDocuments({ tenantId: req.user.tenantId }),
      Category.countDocuments({ tenantId: req.user.tenantId }),
      Product.find({ tenantId: req.user.tenantId }, "stock reorderLevel unitPrice costPrice name"),
    ]);

    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.reorderLevel).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const totalStockValue = products.reduce((sum, p) => sum + p.unitPrice * p.stock, 0);
    const totalCostValue = products.reduce((sum, p) => sum + (p.costPrice || 0) * p.stock, 0);

    // Only include financial data for owners
    const result = {
      totalProducts,
      totalCategories,
      lowStock,
      outOfStock,
    };

    if (req.user.role === "owner") {
      result.totalStockValue = totalStockValue;
      result.totalCostValue = totalCostValue;
      result.potentialProfit = totalStockValue - totalCostValue;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard" });
  }
});

// Weekly sales data for chart
router.get("/weekly-sales", async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const sales = await Sale.find({ createdAt: { $gte: weekAgo }, tenantId: req.user.tenantId });

    // Group by day
    const days = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-IN", { weekday: "short" });
      days[key] = { revenue: 0, items: 0, count: 0 };
    }

    sales.forEach((s) => {
      const key = new Date(s.createdAt).toLocaleDateString("en-IN", { weekday: "short" });
      if (days[key]) {
        days[key].revenue += s.total;
        days[key].items += s.items.reduce((sum, item) => sum + item.quantity, 0);
        days[key].count += 1;
      }
    });

    res.json(
      Object.entries(days).map(([day, data]) => ({
        day,
        revenue: data.revenue,
        items: data.items,
        count: data.count,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to load sales data" });
  }
});

// Recent transactions (movements + sales)
router.get("/recent-activity", async (req, res) => {
  try {
    const movements = await StockMovement.find({ tenantId: req.user.tenantId })
      .populate("product", "name sku")
      .populate("performedBy", "username role")
      .sort({ createdAt: -1 })
      .limit(8);

    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: "Failed to load recent activity" });
  }
});

// Category stock distribution
router.get("/category-distribution", async (req, res) => {
  try {
    const categories = await Category.find({ tenantId: req.user.tenantId }, "name");
    const products = await Product.find({ tenantId: req.user.tenantId }, "category stock unitPrice");

    const dist = categories.map((cat) => {
      const catProducts = products.filter((p) => String(p.category) === String(cat._id));
      return {
        name: cat.name,
        products: catProducts.length,
        totalStock: catProducts.reduce((s, p) => s + p.stock, 0),
        value: catProducts.reduce((s, p) => s + p.unitPrice * p.stock, 0),
      };
    }).filter((d) => d.products > 0);

    res.json(dist);
  } catch (error) {
    res.status(500).json({ message: "Failed to load distribution" });
  }
});

// Top selling products
router.get("/top-products", async (req, res) => {
  try {
    const sales = await Sale.find({ tenantId: req.user.tenantId });
    const productSales = {};

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const key = String(item.product);
        if (!productSales[key]) {
          productSales[key] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[key].quantity += item.quantity;
        productSales[key].revenue += item.lineTotal;
      });
    });

    const sorted = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: "Failed to load top products" });
  }
});

export default router;

import express from "express";
import PDFDocument from "pdfkit";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Sale from "../models/Sale.js";
import StockMovement from "../models/StockMovement.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();
router.use(protect, authorize("owner", "stockmgr"));

// Reports summary
router.get("/summary", async (req, res) => {
  try {
    const sales = await Sale.find();
    const products = await Product.find().populate("category", "name");
    const categories = await Category.find();

    // Revenue & invoices
    const revenue = sales.reduce((sum, s) => sum + s.total, 0);
    const invoices = sales.length;
    const taxCollected = sales.reduce((sum, s) => sum + (s.taxAmount || 0), 0);

    // Loss/damage from adjustments
    const adjustments = await StockMovement.find({ type: "adjustment", direction: "out" });
    const loss = adjustments.reduce((sum, a) => {
      const product = products.find((p) => String(p._id) === String(a.product));
      return sum + (product ? product.unitPrice * a.quantity : 0);
    }, 0);

    // Category sales breakdown
    const categorySales = {};
    categories.forEach((c) => { categorySales[c.name] = 0; });

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = products.find((p) => String(p._id) === String(item.product));
        if (product && product.category) {
          const catName = product.category.name || "Uncategorized";
          categorySales[catName] = (categorySales[catName] || 0) + item.lineTotal;
        }
      });
    });

    // Monthly revenue trend (last 6 months)
    const revenueTrend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthSales = sales.filter((s) => {
        const d = new Date(s.createdAt);
        return d >= monthStart && d <= monthEnd;
      });
      revenueTrend.push({
        month: monthStart.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        revenue: monthSales.reduce((sum, s) => sum + s.total, 0),
        count: monthSales.length,
      });
    }

    // Payment method breakdown
    const paymentBreakdown = {
      cash: sales.filter((s) => s.paymentMethod === "cash").reduce((sum, s) => sum + s.total, 0),
      card: sales.filter((s) => s.paymentMethod === "card").reduce((sum, s) => sum + s.total, 0),
      upi: sales.filter((s) => s.paymentMethod === "upi").reduce((sum, s) => sum + s.total, 0),
    };

    // Inventory stats
    const totalProducts = products.length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.reorderLevel).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const totalStockValue = products.reduce((sum, p) => sum + p.unitPrice * p.stock, 0);

    res.json({
      revenue,
      invoices,
      taxCollected,
      loss,
      categorySales,
      revenueTrend,
      paymentBreakdown,
      totalProducts,
      totalCategories: categories.length,
      lowStock,
      outOfStock,
      totalStockValue,
    });
  } catch (error) {
    console.log("Report error:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
});

// Download PDF report
router.get("/pdf", async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    const products = await Product.find();
    const categories = await Category.find();

    const revenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalProducts = products.length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.reorderLevel).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const totalStockValue = products.reduce((sum, p) => sum + p.unitPrice * p.stock, 0);

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Stockly_Report_${dateStr}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(22).font("Helvetica-Bold").text("STOCKLY", { align: "center" });
    doc.fontSize(10).font("Helvetica").text("Inventory Management System", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor("#666").text(`Generated: ${new Date().toLocaleString("en-IN")}`, { align: "center" });
    doc.moveDown(1);

    // Divider
    doc.strokeColor("#ddd").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // System Summary
    doc.fillColor("#111").fontSize(14).font("Helvetica-Bold").text("System Summary");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    const summaryData = [
      ["Total Revenue", `INR ${revenue.toLocaleString("en-IN")}`],
      ["Total Invoices", `${sales.length}`],
      ["Total Products", `${totalProducts}`],
      ["Low Stock Items", `${lowStock}`],
      ["Out of Stock", `${outOfStock}`],
      ["Total Categories", `${categories.length}`],
      ["Inventory Value", `INR ${totalStockValue.toLocaleString("en-IN")}`],
    ];

    summaryData.forEach(([label, val]) => {
      doc.fillColor("#333").text(`${label}:  `, { continued: true }).fillColor("#111").font("Helvetica-Bold").text(val);
      doc.font("Helvetica");
    });

    doc.moveDown(1);
    doc.strokeColor("#ddd").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Recent Transactions
    doc.fillColor("#111").fontSize(14).font("Helvetica-Bold").text("Recent Transactions");
    doc.moveDown(0.5);

    const recentSales = sales.slice(0, 10);
    if (recentSales.length === 0) {
      doc.fontSize(10).font("Helvetica").fillColor("#666").text("No transactions recorded yet.");
    } else {
      // Table header
      const tableTop = doc.y;
      doc.fontSize(8).font("Helvetica-Bold").fillColor("#555");
      doc.text("Sale ID", 50, tableTop, { width: 80 });
      doc.text("Date", 130, tableTop, { width: 90 });
      doc.text("Items", 220, tableTop, { width: 40 });
      doc.text("Payment", 260, tableTop, { width: 60 });
      doc.text("Amount", 340, tableTop, { width: 80, align: "right" });
      doc.moveDown(0.5);
      doc.strokeColor("#eee").lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();

      recentSales.forEach((sale) => {
        const y = doc.y + 4;
        if (y > 720) { doc.addPage(); }
        doc.fontSize(8).font("Helvetica").fillColor("#333");
        doc.text(sale.saleId, 50, doc.y + 4, { width: 80 });
        doc.text(new Date(sale.createdAt).toLocaleDateString("en-IN"), 130, doc.y, { width: 90 });
        doc.text(`${sale.items.length}`, 220, doc.y, { width: 40 });
        doc.text(sale.paymentMethod.toUpperCase(), 260, doc.y, { width: 60 });
        doc.text(`INR ${sale.total.toLocaleString("en-IN")}`, 340, doc.y, { width: 80, align: "right" });
        doc.moveDown(0.3);
      });
    }

    doc.moveDown(2);

    // Footer
    doc.fontSize(8).fillColor("#999").text("This is a system-generated report. Stockly Inventory Management System.", 50, 770, { align: "center", width: 495 });

    doc.end();
  } catch (error) {
    console.log("PDF error:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});

export default router;

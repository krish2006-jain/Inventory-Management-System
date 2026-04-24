/**
 * Stockly — Realistic Indian Retail Seed Data
 * Run: node scripts/seed.js
 * 
 * Creates: 1 Owner, 1 Stock Manager, 1 Cashier,
 *          8 Categories, 6 Suppliers, 30 Products,
 *          Sample stock movements and sales
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import Sale from "../models/Sale.js";
import Settings from "../models/Settings.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/stockly";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("⚡ Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Supplier.deleteMany({}),
    Product.deleteMany({}),
    StockMovement.deleteMany({}),
    Sale.deleteMany({}),
    Settings.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data");

  // ── Users ──
  const owner = await User.create({
    username: "Demo Owner",
    email: "demo@stockly.com",
    password: "12345678",
    role: "owner",
    phone: "9876543210",
    status: "Active",
  });

  const stockMgr = await User.create({
    username: "Admin Stock",
    email: "krishkjai90@gmail.com",
    password: "g7FHgZeCun",
    role: "stockmgr",
    phone: "9876543211",
    status: "Active",
    tenantId: owner._id,
  });

  const cashier = await User.create({
    username: "Billing Staff",
    email: "krishkamlesh17@gmail.com",
    password: "dVF5VWVUz4",
    role: "cashier",
    phone: "9876543212",
    status: "Active",
    tenantId: owner._id,
  });

  console.log("👤 Users created:");
  console.log("   Owner:    demo@stockly.com / 12345678");
  console.log("   StockMgr: krishkjai90@gmail.com / g7FHgZeCun");
  console.log("   Cashier:  krishkamlesh17@gmail.com / dVF5VWVUz4");

  // ── Settings ──
  await Settings.create({
    storeName: "Rajesh General Store",
    storeAddress: "Shop No. 12, MG Road, Indore, MP 452001",
    storePhone: "9876543210",
    storeEmail: "rajesh.store@gmail.com",
    storeUpiId: "rajeshstore@upi",
    taxRate: 18,
    taxLabel: "GST",
    currency: "INR",
    currencySymbol: "₹",
    tenantId: owner._id,
  });

  // ── Categories ──
  const categories = await Category.insertMany([
    { name: "Dairy", description: "Milk, curd, paneer, butter", color: "#3b82f6", icon: "🥛", createdBy: owner._id, tenantId: owner._id },
    { name: "FMCG", description: "Fast moving consumer goods", color: "#f59e0b", icon: "📦", createdBy: owner._id, tenantId: owner._id },
    { name: "Beverages", description: "Juices, soft drinks, water", color: "#10b981", icon: "🥤", createdBy: owner._id, tenantId: owner._id },
    { name: "Snacks", description: "Chips, biscuits, namkeen", color: "#ef4444", icon: "🍪", createdBy: owner._id, tenantId: owner._id },
    { name: "Personal Care", description: "Soaps, shampoo, toothpaste", color: "#8b5cf6", icon: "🧴", createdBy: owner._id, tenantId: owner._id },
    { name: "Grains & Pulses", description: "Rice, wheat, dal, atta", color: "#d97706", icon: "🌾", createdBy: owner._id, tenantId: owner._id },
    { name: "Spices & Masala", description: "Turmeric, chilli, garam masala", color: "#dc2626", icon: "🌶️", createdBy: owner._id, tenantId: owner._id },
    { name: "Cooking Oil", description: "Refined, mustard, coconut oil", color: "#059669", icon: "🫒", createdBy: owner._id, tenantId: owner._id },
  ]);
  const catMap = {};
  categories.forEach((c) => (catMap[c.name] = c._id));
  console.log("📂 8 Categories created");

  // ── Suppliers ──
  const suppliers = await Supplier.insertMany([
    { name: "Metro Cash & Carry", email: "orders@metro.in", phone: "9001234567", category: "Wholesale", address: "Plot 45, Industrial Area, Indore", rating: 4.5, createdBy: owner._id, tenantId: owner._id },
    { name: "Amul Distributors", email: "supply@amul.coop", phone: "9001234568", category: "Dairy", address: "Amul Dairy Road, Anand, Gujarat", rating: 5, createdBy: owner._id, tenantId: owner._id },
    { name: "ITC Limited", email: "fmcg@itc.in", phone: "9001234569", category: "FMCG", address: "Virginia House, Kolkata", rating: 4.8, createdBy: owner._id, tenantId: owner._id },
    { name: "Haldiram's Nagpur", email: "wholesale@haldirams.com", phone: "9001234570", category: "Snacks", address: "Haldiram Lane, Nagpur", rating: 4.6, createdBy: owner._id, tenantId: owner._id },
    { name: "Patanjali Ayurved", email: "orders@patanjali.in", phone: "9001234571", category: "FMCG", address: "Patanjali Yogpeeth, Haridwar", rating: 4.2, createdBy: owner._id, tenantId: owner._id },
    { name: "Fortune Oil Depot", email: "supply@adanigroup.com", phone: "9001234572", category: "Cooking Oil", address: "Industrial Estate, Mundra", rating: 4.4, createdBy: owner._id, tenantId: owner._id },
  ]);
  const supMap = {};
  suppliers.forEach((s) => (supMap[s.name] = s._id));
  console.log("🏢 6 Suppliers created");

  // ── Products ──
  const productsData = [
    // Dairy
    { name: "Amul Butter 500g", sku: "DAI-001", category: catMap["Dairy"], supplier: supMap["Amul Distributors"], unitPrice: 275, costPrice: 240, stock: 45, reorderLevel: 15, unit: "pcs" },
    { name: "Mother Dairy Curd 400g", sku: "DAI-002", category: catMap["Dairy"], supplier: supMap["Amul Distributors"], unitPrice: 40, costPrice: 32, stock: 80, reorderLevel: 25, unit: "pcs" },
    { name: "Amul Gold Milk 1L", sku: "DAI-003", category: catMap["Dairy"], supplier: supMap["Amul Distributors"], unitPrice: 68, costPrice: 58, stock: 120, reorderLevel: 40, unit: "pcs" },
    { name: "Amul Paneer 200g", sku: "DAI-004", category: catMap["Dairy"], supplier: supMap["Amul Distributors"], unitPrice: 90, costPrice: 72, stock: 8, reorderLevel: 15, unit: "pcs" },

    // FMCG
    { name: "Surf Excel Quick Wash 1kg", sku: "FMC-001", category: catMap["FMCG"], supplier: supMap["ITC Limited"], unitPrice: 220, costPrice: 185, stock: 35, reorderLevel: 10, unit: "pcs" },
    { name: "Tata Salt 1kg", sku: "FMC-002", category: catMap["FMCG"], supplier: supMap["ITC Limited"], unitPrice: 28, costPrice: 22, stock: 150, reorderLevel: 30, unit: "pcs" },
    { name: "Vim Dishwash Bar 200g", sku: "FMC-003", category: catMap["FMCG"], supplier: supMap["ITC Limited"], unitPrice: 30, costPrice: 24, stock: 90, reorderLevel: 20, unit: "pcs" },
    { name: "Colgate MaxFresh 150g", sku: "FMC-004", category: catMap["Personal Care"], supplier: supMap["Patanjali Ayurved"], unitPrice: 95, costPrice: 78, stock: 60, reorderLevel: 15, unit: "pcs" },

    // Beverages
    { name: "Thums Up 2L", sku: "BEV-001", category: catMap["Beverages"], supplier: supMap["Metro Cash & Carry"], unitPrice: 90, costPrice: 72, stock: 48, reorderLevel: 20, unit: "pcs" },
    { name: "Real Fruit Juice Mango 1L", sku: "BEV-002", category: catMap["Beverages"], supplier: supMap["ITC Limited"], unitPrice: 110, costPrice: 88, stock: 30, reorderLevel: 12, unit: "pcs" },
    { name: "Paper Boat Aam Panna 200ml", sku: "BEV-003", category: catMap["Beverages"], supplier: supMap["Metro Cash & Carry"], unitPrice: 30, costPrice: 22, stock: 5, reorderLevel: 15, unit: "pcs" },
    { name: "Bisleri Water 1L (Pack of 12)", sku: "BEV-004", category: catMap["Beverages"], supplier: supMap["Metro Cash & Carry"], unitPrice: 180, costPrice: 144, stock: 25, reorderLevel: 10, unit: "pack" },

    // Snacks
    { name: "Haldiram's Aloo Bhujia 400g", sku: "SNK-001", category: catMap["Snacks"], supplier: supMap["Haldiram's Nagpur"], unitPrice: 120, costPrice: 95, stock: 40, reorderLevel: 12, unit: "pcs" },
    { name: "Lay's Classic Salted 52g", sku: "SNK-002", category: catMap["Snacks"], supplier: supMap["Metro Cash & Carry"], unitPrice: 20, costPrice: 15, stock: 200, reorderLevel: 50, unit: "pcs" },
    { name: "Parle-G Gold Biscuits 1kg", sku: "SNK-003", category: catMap["Snacks"], supplier: supMap["Metro Cash & Carry"], unitPrice: 95, costPrice: 76, stock: 55, reorderLevel: 15, unit: "pcs" },
    { name: "Kurkure Masala Munch 100g", sku: "SNK-004", category: catMap["Snacks"], supplier: supMap["Haldiram's Nagpur"], unitPrice: 20, costPrice: 14, stock: 0, reorderLevel: 30, unit: "pcs" },

    // Personal Care
    { name: "Dove Soap 100g", sku: "PER-001", category: catMap["Personal Care"], supplier: supMap["ITC Limited"], unitPrice: 62, costPrice: 48, stock: 70, reorderLevel: 20, unit: "pcs" },
    { name: "Head & Shoulders Shampoo 340ml", sku: "PER-002", category: catMap["Personal Care"], supplier: supMap["Metro Cash & Carry"], unitPrice: 370, costPrice: 310, stock: 22, reorderLevel: 8, unit: "pcs" },
    { name: "Patanjali Dant Kanti 200g", sku: "PER-003", category: catMap["Personal Care"], supplier: supMap["Patanjali Ayurved"], unitPrice: 75, costPrice: 55, stock: 3, reorderLevel: 10, unit: "pcs" },

    // Grains & Pulses
    { name: "India Gate Basmati Rice 5kg", sku: "GRN-001", category: catMap["Grains & Pulses"], supplier: supMap["Metro Cash & Carry"], unitPrice: 550, costPrice: 460, stock: 18, reorderLevel: 8, unit: "pcs" },
    { name: "Aashirvaad Atta 10kg", sku: "GRN-002", category: catMap["Grains & Pulses"], supplier: supMap["ITC Limited"], unitPrice: 440, costPrice: 380, stock: 25, reorderLevel: 10, unit: "pcs" },
    { name: "Toor Dal 1kg", sku: "GRN-003", category: catMap["Grains & Pulses"], supplier: supMap["Metro Cash & Carry"], unitPrice: 160, costPrice: 130, stock: 40, reorderLevel: 15, unit: "kg" },
    { name: "Moong Dal 1kg", sku: "GRN-004", category: catMap["Grains & Pulses"], supplier: supMap["Metro Cash & Carry"], unitPrice: 140, costPrice: 115, stock: 35, reorderLevel: 12, unit: "kg" },

    // Spices & Masala
    { name: "MDH Garam Masala 100g", sku: "SPC-001", category: catMap["Spices & Masala"], supplier: supMap["Metro Cash & Carry"], unitPrice: 85, costPrice: 65, stock: 45, reorderLevel: 15, unit: "pcs" },
    { name: "Everest Turmeric Powder 200g", sku: "SPC-002", category: catMap["Spices & Masala"], supplier: supMap["Metro Cash & Carry"], unitPrice: 58, costPrice: 42, stock: 60, reorderLevel: 20, unit: "pcs" },
    { name: "Catch Red Chilli Powder 200g", sku: "SPC-003", category: catMap["Spices & Masala"], supplier: supMap["Metro Cash & Carry"], unitPrice: 65, costPrice: 48, stock: 50, reorderLevel: 18, unit: "pcs" },

    // Cooking Oil
    { name: "Fortune Sunflower Oil 5L", sku: "OIL-001", category: catMap["Cooking Oil"], supplier: supMap["Fortune Oil Depot"], unitPrice: 750, costPrice: 650, stock: 15, reorderLevel: 6, unit: "pcs" },
    { name: "Saffola Gold Oil 1L", sku: "OIL-002", category: catMap["Cooking Oil"], supplier: supMap["Fortune Oil Depot"], unitPrice: 210, costPrice: 175, stock: 28, reorderLevel: 10, unit: "pcs" },
    { name: "Patanjali Mustard Oil 1L", sku: "OIL-003", category: catMap["Cooking Oil"], supplier: supMap["Patanjali Ayurved"], unitPrice: 165, costPrice: 130, stock: 20, reorderLevel: 8, unit: "pcs" },
    { name: "Parachute Coconut Oil 500ml", sku: "OIL-004", category: catMap["Cooking Oil"], supplier: supMap["Metro Cash & Carry"], unitPrice: 110, costPrice: 88, stock: 35, reorderLevel: 12, unit: "pcs" },
  ];

  const products = await Product.insertMany(
    productsData.map((p) => ({ ...p, createdBy: owner._id, tenantId: owner._id }))
  );
  console.log(`📦 ${products.length} Products created`);

  // ── Sample Stock Movements ──
  const movementData = [];
  const now = new Date();
  for (let i = 0; i < 15; i++) {
    const p = products[Math.floor(Math.random() * products.length)];
    const qty = Math.floor(Math.random() * 30) + 5;
    const daysAgo = Math.floor(Math.random() * 7);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));

    movementData.push({
      product: p._id,
      type: i % 3 === 0 ? "adjustment" : "receive",
      direction: "in",
      quantity: qty,
      previousStock: p.stock,
      newStock: p.stock + qty,
      reason: i % 3 === 0 ? "Found Misplaced Stock" : "Purchase Order Delivery",
      note: "",
      reference: i % 3 !== 0 ? `PO-2025-${String(i + 1).padStart(4, "0")}` : "",
      performedBy: i % 2 === 0 ? stockMgr._id : owner._id,
      tenantId: owner._id,
      createdAt: date,
    });
  }
  await StockMovement.insertMany(movementData);
  console.log("📋 15 Stock movements created");

  // ── Sample Sales ──
  const salesData = [];
  for (let i = 0; i < 12; i++) {
    const numItems = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let subtotal = 0;
    for (let j = 0; j < numItems; j++) {
      const p = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const lineTotal = p.unitPrice * qty;
      items.push({
        product: p._id,
        name: p.name,
        quantity: qty,
        unitPrice: p.unitPrice,
        lineTotal,
      });
      subtotal += lineTotal;
    }
    const taxAmount = Math.round(subtotal * 0.18);
    const total = subtotal + taxAmount;
    const daysAgo = Math.floor(Math.random() * 3);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 10) + 9, Math.floor(Math.random() * 60));

    const methods = ["cash", "card", "upi"];
    const pm = methods[Math.floor(Math.random() * methods.length)];

    salesData.push({
      saleId: `SALE-${String(i + 1).padStart(5, "0")}`,
      items,
      subtotal,
      discountType: "none",
      discountValue: 0,
      discountAmount: 0,
      taxRate: 18,
      taxLabel: "GST",
      taxAmount,
      total,
      paymentMethod: pm,
      amountTendered: pm === "cash" ? Math.ceil(total / 100) * 100 : 0,
      changeDue: pm === "cash" ? Math.ceil(total / 100) * 100 - total : 0,
      cashier: cashier._id,
      cashierName: "Priya Sharma",
      tenantId: owner._id,
      createdAt: date,
    });
  }
  await Sale.insertMany(salesData);
  console.log("💰 12 Sample sales created");

  console.log("\n✅ Seed complete! Login credentials:");
  console.log("┌─────────────────┬───────────────────────────┬──────────────┐");
  console.log("│ Role            │ Email                     │ Password     │");
  console.log("├─────────────────┼───────────────────────────┼──────────────┤");
  console.log("│ Owner           │ demo@stockly.com          │ 12345678     │");
  console.log("│ Stock Manager   │ krishkjai90@gmail.com     │ g7FHgZeCun   │");
  console.log("│ Cashier         │ krishkamlesh17@gmail.com  │ dVF5VWVUz4   │");
  console.log("└─────────────────┴───────────────────────────┴──────────────┘");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

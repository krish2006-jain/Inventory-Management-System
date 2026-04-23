import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne();
  if (!user) {
    throw new Error("No user found to set createdBy");
  }

  const category = await Category.findOneAndUpdate(
    { name: "Electronics" },
    {
      $setOnInsert: {
        name: "Electronics",
        description: "Electronic devices and tools",
        color: "#6c4ef2",
        icon: "🔌",
        createdBy: user._id,
      },
    },
    { returnDocument: "after", upsert: true },
  );

  const supplier = await Supplier.findOneAndUpdate(
    { name: "TechParts Ltd", createdBy: user._id },
    {
      $setOnInsert: {
        name: "TechParts Ltd",
        category: "Electronics",
        email: "sales@techparts.com",
        phone: "9876543210",
        rating: 4.7,
        createdBy: user._id,
      },
    },
    { returnDocument: "after", upsert: true },
  );

  const products = [
    {
      name: "Wireless Scanner",
      sku: "WS-001",
      unitPrice: 2400,
      stock: 45,
      reorderLevel: 20,
      unit: "Unit",
      location: "Aisle A, Shelf 1",
    },
    {
      name: "Barcode Labels (500)",
      sku: "BL-500",
      unitPrice: 350,
      stock: 12,
      reorderLevel: 25,
      unit: "Pack",
      location: "Aisle A, Shelf 3",
    },
    {
      name: "QR Scanner Pro",
      sku: "QR-PRO",
      unitPrice: 4500,
      stock: 35,
      reorderLevel: 10,
      unit: "Unit",
      location: "Aisle B, Shelf 2",
    },
  ];

  for (const item of products) {
    await Product.findOneAndUpdate(
      { sku: item.sku },
      {
        $setOnInsert: {
          ...item,
          category: category._id,
          supplier: supplier._id,
          createdBy: user._id,
        },
      },
      { returnDocument: "after", upsert: true },
    );
  }

  const counts = {
    users: await User.countDocuments(),
    categories: await Category.countDocuments(),
    suppliers: await Supplier.countDocuments(),
    products: await Product.countDocuments(),
  };

  console.log("Seed complete", counts);
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error("Seed failed:", error.message);
  try {
    await mongoose.disconnect();
  } catch {
    // no-op
  }
  process.exit(1);
});

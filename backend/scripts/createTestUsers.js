import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Create test users for each role
    const testUsers = [
      {
        username: "owner1",
        email: "owner@test.com",
        password: "password123",
        role: "owner",
        phone: "9876543210",
        status: "Active",
      },
      {
        username: "stockmgr1",
        email: "stockmgr@test.com",
        password: "password123",
        role: "stockmgr",
        phone: "9876543211",
        status: "Active",
      },
      {
        username: "cashier1",
        email: "cashier@test.com",
        password: "password123",
        role: "cashier",
        phone: "9876543212",
        status: "Active",
      },
    ];

    for (const userData of testUsers) {
      const userExists = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }],
      });

      if (!userExists) {
        const user = await User.create(userData);
        console.log(`✓ Created user: ${userData.username} (${userData.role})`);
      } else {
        console.log(`✗ User already exists: ${userData.email}`);
      }
    }

    const userCount = await User.countDocuments();
    console.log(`\nTotal users in database: ${userCount}`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

createTestUsers();

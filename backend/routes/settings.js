import express from "express";
import Settings from "../models/Settings.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Get settings (any authenticated user can read for POS tax etc.)
router.get("/", protect, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to load settings" });
  }
});

// Update settings (owner only)
router.patch("/", protect, authorize("owner"), async (req, res) => {
  try {
    const allowedKeys = [
      "storeName", "storeAddress", "storePhone", "storeEmail",
      "storeUpiId", "taxRate", "taxLabel", "currency", "currencySymbol",
      "lowStockEmailEnabled", "lowStockEmail",
      "dailySummaryEnabled", "dailySummaryTime",
    ];

    const updates = {};
    allowedKeys.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(updates);
    } else {
      Object.assign(settings, updates);
      await settings.save();
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to update settings" });
  }
});

export default router;

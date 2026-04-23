import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "Stockly Store" },
    storeAddress: { type: String, default: "" },
    storePhone: { type: String, default: "" },
    storeEmail: { type: String, default: "" },
    storeUpiId: { type: String, default: "" },
    taxRate: { type: Number, min: 0, max: 100, default: 18 },
    taxLabel: { type: String, default: "GST" },
    currency: { type: String, default: "INR" },
    currencySymbol: { type: String, default: "₹" },
    lowStockEmailEnabled: { type: Boolean, default: false },
    lowStockEmail: { type: String, default: "" },
    dailySummaryEnabled: { type: Boolean, default: false },
    dailySummaryTime: { type: String, default: "18:00" },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;

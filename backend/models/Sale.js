import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, min: 1, required: true },
    unitPrice: { type: Number, min: 0, required: true },
    lineTotal: { type: Number, min: 0, required: true },
  },
  { _id: false },
);

const saleSchema = new mongoose.Schema(
  {
    saleId: {
      type: String,
      required: true,
    },
    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "At least one sale item is required",
      },
    },
    subtotal: { type: Number, min: 0, required: true },
    discountType: {
      type: String,
      enum: ["flat", "percent", "none"],
      default: "none",
    },
    discountValue: { type: Number, min: 0, default: 0 },
    discountAmount: { type: Number, min: 0, default: 0 },
    taxRate: { type: Number, min: 0, default: 0 },
    taxLabel: { type: String, default: "GST" },
    taxAmount: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi"],
      required: true,
    },
    amountTendered: { type: Number, default: 0 },
    changeDue: { type: Number, default: 0 },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cashierName: { type: String, required: true },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

saleSchema.index({ cashier: 1, createdAt: -1 });
saleSchema.index({ createdAt: -1 });
saleSchema.index({ tenantId: 1, saleId: 1 }, { unique: true });

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;

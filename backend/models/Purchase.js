import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      min: 1,
      required: true,
    },
    unitCost: {
      type: Number,
      min: 0,
      required: true,
    },
  },
  { _id: false },
);

const purchaseSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      trim: true,
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Transit", "Received", "Cancelled"],
      default: "Pending",
    },
    items: {
      type: [purchaseItemSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "At least one purchase item is required",
      },
    },
    totalAmount: {
      type: Number,
      min: 0,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    expectedDate: {
      type: Date,
      default: null,
    },
    receivedDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

purchaseSchema.index({ tenantId: 1, poNumber: 1 }, { unique: true });

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;

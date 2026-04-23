import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    unitPrice: {
      type: Number,
      min: 0,
      required: true,
    },
    costPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    stock: {
      type: Number,
      min: 0,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      min: 0,
      default: 10,
    },
    unit: {
      type: String,
      trim: true,
      default: "Unit",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", sku: "text" });

// Virtual: profit margin percentage
productSchema.virtual("profitMargin").get(function () {
  if (!this.unitPrice || this.unitPrice === 0) return 0;
  return ((this.unitPrice - (this.costPrice || 0)) / this.unitPrice) * 100;
});

// Virtual: stock status
productSchema.virtual("status").get(function () {
  if (this.stock === 0) return "Out of Stock";
  if (this.stock <= this.reorderLevel) return "Low Stock";
  return "In Stock";
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.model("Product", productSchema);

export default Product;

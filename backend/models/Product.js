import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  size: [{ type: String }],
  color: [{ type: String }],
  images: [{ type: String }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: { type: String, required: true },
  material: { type: String },
  stockQuantity: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  brand: { type: String },
  weight: { type: Number, default: 0 },
  dimensions: { type: Map, of: String },
  specifications: { type: Map, of: String },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Product", productSchema);

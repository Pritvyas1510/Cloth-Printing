import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    size: {
      type: [String],
      enum: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"],
      default: [],
    },
    color: {
      type: [String],
      enum: [
        "Red",
        "Blue",
        "Green",
        "Black",
        "White",
        "Yellow",
        "Orange",
        "Purple",
        "Pink",
        "Brown",
        "Gray",
        "Cyan",
        "Magenta",
        "Navy",
        "Teal",
        "Maroon",
        "Olive",
        "Lime",
        "Silver",
        "Gold",
      ],
      default: [],
    },
    images: {
      type: [String],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "T-Shirt",
        "Shirt",
        "Jeans",
        "Jacket",
        "Sweater",
        "Dress",
        "Skirt",
        "Pants",
        "Shorts",
        "Hoodie",
        "Accessories",
        "Other",
      ],
      required: true,
    },
    material: {
      type: String,
      trim: true,
      default: "",
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    discount: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
      default: 0,
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
      default: 0,
    },
    dimensions: {
      length: { type: Number, min: 0, default: 0 },
      width: { type: Number, min: 0, default: 0 },
      height: { type: Number, min: 0, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      average: { type: Number, min: 0, max: 5, default: 0 },
      count: { type: Number, min: 0, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
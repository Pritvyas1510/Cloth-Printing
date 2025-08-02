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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);

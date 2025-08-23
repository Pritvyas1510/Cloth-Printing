import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      title: { type: String, required: true },
      color: { type: String },
      size: { type: String },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      designDescription: { type: String },
      customDesign: { type: String },

      // Admin uploads this after designing
      designProofImage: { type: String },

      // Admin uploads this after shipping
      shippingSlipImage: { type: String },

      // User uploads this after receiving
      deliveredImage: { type: String },
      deliveredImageStatus: {
        type: String,
        enum: ["pending", "confirmed", "rejected"],
        default: "pending",
      },
    },
  ],

  totalAmount: { type: Number, required: true },

  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },

  paymentMethod: { type: String, required: true },
  paymentStatus: {
    type: String,
    enum: ["pending", "done"],
    default: "pending",
  },

  // Razorpay integration fields
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },

  status: {
    type: String,
    enum: [ "processing", "design" ,"shipped", "delivered" ],
    default: "processing",
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema);

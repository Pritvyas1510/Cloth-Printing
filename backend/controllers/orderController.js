import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import cloudinary from "../utils/cloudinary.js"; // Added import
import crypto from "crypto";
import mongoose from "mongoose";

export const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderDetails,
  } = req.body;
  const { RAZORPAY_SECRET } = process.env;

  try {
    if (!RAZORPAY_SECRET) {
      throw new Error("RAZORPAY_SECRET environment variable is missing");
    }

    // Verify signature
    const hmac = crypto.createHmac("sha256", RAZORPAY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ message: "Payment verification failed: Invalid signature" });
    }

    if (!req.user?._id) {
      throw new Error("User ID is required for order creation");
    }

    // ✅ Always create a new Order (don’t try to find a pending one)
    const order = new Order({
      user: req.user._id,
      products: orderDetails.products.map((item) => ({
        product: item.productId,
        title: item.title || "Untitled",
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        designDescription: item.designDescription,
        customDesign: item.customDesign,
      })),
      totalAmount: orderDetails.totalAmount,
      address: orderDetails.address,
      paymentMethod: orderDetails.paymentMethod,
      paymentStatus: "done",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    await order.save();
    console.log(`Order saved: ${order._id}`);

    // ✅ Clear cart if it exists
    const sessionId = req.headers["x-session-id"];
    const userId = req.user._id;
    let cart =
      (await Cart.findOne({ userId })) ||
      (sessionId ? await Cart.findOne({ sessionId }) : null);

    if (cart && cart.items && cart.items.length > 0) {
      for (const item of cart.items) {
        if (item.customDesign) {
          await cloudinary.uploader.destroy(item.customDesign).catch(() => {});
        }
      }
      cart.items = [];
      cart.updatedAt = Date.now();
      await cart.save();
      console.log(`Cart cleared for userId: ${userId}, sessionId: ${sessionId}`);
    } else {
      console.warn(
        `No cart found to clear for userId: ${userId}, sessionId: ${sessionId}`
      );
    }

    return res.json({ message: "Payment verified and cart cleared", order });
  } catch (err) {
    console.error("Verify Payment Error:", {
      message: err.message,
      stack: err.stack,
      orderDetails,
      userId: req.user?._id,
      sessionId: req.headers["x-session-id"],
    });
    return res.status(500).json({
      message: "Failed to verify payment or clear cart",
      error: err.message,
    });
  }
};


export const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, address, paymentMethod, paymentStatus } =
      req.body;
    const sessionId = req.headers["x-session-id"];
    const userId = req.user?._id;

    console.log(
      `Creating order for userId: ${userId}, sessionId: ${sessionId}`
    );

    if (!sessionId && !userId) {
      return res
        .status(400)
        .json({ message: "Session ID or user ID is required" });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Products array is required and must not be empty" });
    }

    // Validate product data
    for (const item of products) {
      if (
        !mongoose.Types.ObjectId.isValid(item.productId) ||
        !Number.isFinite(item.quantity) ||
        !Number.isFinite(item.price)
      ) {
        return res.status(400).json({
          message:
            "Invalid product data: each product must have a valid productId (ObjectId), quantity (number), and price (number)",
        });
      }
    }

    if (!totalAmount || !address || !paymentMethod) {
      return res.status(400).json({
        message: "Total amount, address, and payment method are required",
      });
    }

    const order = await Order.create({
      user: userId || null, // Allow null for guest users if needed
      products: products.map((item) => ({
        product: item.productId,
        title: item.title,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        designDescription: item.designDescription,
        customDesign: item.customDesign,
      })),
      totalAmount,
      address,
      paymentMethod,
      paymentStatus,
      status: "pending",
    });

    console.log(`Order created: ${order._id}`);

    // Clear the entire cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
      if (!cart && sessionId) {
        const guestCart = await Cart.findOne({ sessionId });
        if (guestCart) {
          console.log(
            `Migrating guest cart for sessionId: ${sessionId} to userId: ${userId}`
          );
          guestCart.userId = userId;
          guestCart.sessionId = null;
          await guestCart.save();
          cart = await Cart.findOne({ userId });
        }
      }
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    if (cart) {
      for (const item of cart.items) {
        if (item.customDesign) {
          console.log(`Deleting custom design: ${item.customDesign}`);
          await cloudinary.uploader
            .destroy(item.customDesign)
            .catch((err) =>
              console.warn(`Failed to delete image ${item.customDesign}:`, err)
            );
        }
      }
      cart.items = [];
      cart.updatedAt = Date.now();
      await cart.save();
      console.log(
        `Cart cleared for userId: ${userId}, sessionId: ${sessionId}`
      );
    } else {
      console.warn(
        `No cart found for userId: ${userId}, sessionId: ${sessionId}`
      );
    }

    res.status(201).json({ message: "Order created and cart cleared", order });
  } catch (err) {
    console.error("Create order error:", {
      message: err.message,
      stack: err.stack,
      userId: req.user?._id,
      sessionId: req.headers["x-session-id"],
    });
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("products.product");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (
      order.user &&
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    res.status(200).json(order);
  } catch (err) {
    console.error("Get order error:", {
      message: err.message,
      stack: err.stack,
      orderId: req.params.id,
    });
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      const orders = await Order.find({ user: req.user._id })
        .populate("user", "name email")
        .populate("products.product")
        .sort({ createdAt: -1 });
      return res.status(200).json(orders);
    }
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Get all orders error:", {
      message: err.message,
      stack: err.stack,
      userId: req.user._id,
    });
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: Admin access required" });
    }

    if (
      !["pending", "processing", "shipped", "delivered", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Update order status error:", {
      message: err.message,
      stack: err.stack,
      orderId: req.params.id,
    });
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const uploadDeliveredImage = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid order ID or product ID" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (order.status !== "delivered") {
      return res
        .status(400)
        .json({ message: "Order must be in delivered status to upload image" });
    }

    const product = order.products.find(
      (item) => item.product.toString() === productId
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    if (product.deliveredImage) {
      return res
        .status(400)
        .json({ message: "Delivered image already uploaded" });
    }

    const result = await cloudinary.uploader.upload(file.buffer, {
      folder: "delivered_images",
      resource_type: "image",
    });

    product.deliveredImage = result.secure_url;
    product.deliveredImageStatus = "pending";
    await order.save();

    res
      .status(200)
      .json({ message: "Image uploaded", deliveredImage: result.secure_url });
  } catch (err) {
    console.error("Upload delivered image error:", {
      message: err.message,
      stack: err.stack,
      orderId: req.params.orderId,
      productId: req.params.productId,
    });
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const confirmDeliveredImage = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const { status } = req.body;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: Admin access required" });
    }

    if (!["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid order ID or product ID" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const product = order.products.find(
      (item) => item.product.toString() === productId
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    if (!product.deliveredImage) {
      return res.status(400).json({ message: "No delivered image to confirm" });
    }

    product.deliveredImageStatus = status;
    await order.save();

    res.status(200).json({ message: `Delivered image ${status}`, order });
  } catch (err) {
    console.error("Confirm delivered image error:", {
      message: err.message,
      stack: err.stack,
      orderId: req.params.orderId,
      productId: req.params.productId,
    });
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const rateProduct = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const { rating } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid order ID or product ID" });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be an integer between 1 and 5" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (order.status !== "delivered") {
      return res
        .status(400)
        .json({ message: "Order must be delivered to submit a rating" });
    }

    const product = order.products.find(
      (item) => item.product.toString() === productId
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    if (product.deliveredImageStatus !== "confirmed") {
      return res
        .status(400)
        .json({ message: "Delivered image must be confirmed before rating" });
    }

    if (product.rating) {
      return res.status(400).json({ message: "Product already rated" });
    }

    product.rating = rating;
    await order.save();

    res.status(200).json({ message: "Rating submitted", rating });
  } catch (err) {
    console.error("Rate product error:", {
      message: err.message,
      stack: err.stack,
      orderId: req.params.orderId,
      productId: req.params.productId,
    });
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

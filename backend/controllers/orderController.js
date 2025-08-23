import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import cloudinary from "../utils/cloudinary.js";
import crypto from "crypto";
import mongoose from "mongoose";


/**
 * Upload Design Proof Image
 * - Admin uploads a design proof image for a product in an order
 * - Image is already uploaded to Cloudinary (via Multer middleware)
 * - We just save the Cloudinary URL to the product inside the order
 * - Also automatically update order status to "design"
 */
export const uploadDesignProofImage = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No image uploaded" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const product = order.products.find(
      (item) => item.product.toString() === productId
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Save Cloudinary URL
    product.designProofImage = file.path;

    // ✅ Automatically update order status
    order.status = "design";

    await order.save();

    res.status(200).json({
      message: "Design proof uploaded, status set to 'design'",
      designProofImage: file.path,
      status: order.status,
    });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


/**
 * Verify Razorpay Payment
 * - Verifies Razorpay signature using HMAC SHA256
 * - Creates a new order if valid
 * - Clears the user's cart after successful payment
 */
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

    // Generate signature
    const hmac = crypto.createHmac("sha256", RAZORPAY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    // Signature mismatch = invalid
    if (generatedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ message: "Payment verification failed: Invalid signature" });
    }

    // Create new order
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

    // Clear cart
    const sessionId = req.headers["x-session-id"];
    const userId = req.user._id;
    let cart =
      (await Cart.findOne({ userId })) ||
      (sessionId ? await Cart.findOne({ sessionId }) : null);

    if (cart) {
      cart.items = [];
      cart.updatedAt = Date.now();
      await cart.save();
    }

    return res.json({ message: "Payment verified and cart cleared", order });
  } catch (err) {
    console.error("Verify Payment Error:", err.message);
    return res.status(500).json({
      message: "Failed to verify payment or clear cart",
      error: err.message,
    });
  }
};

/**
 * Create Order
 * - Creates a new order from cart/checkout
 * - Clears the cart after creating order
 */
export const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, address, paymentMethod, paymentStatus } =
      req.body;
    const sessionId = req.headers["x-session-id"];
    const userId = req.user?._id;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products array is required" });
    }

    const order = await Order.create({
      user: userId || null,
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

    // Clear cart
    let cart = userId
      ? await Cart.findOne({ userId })
      : await Cart.findOne({ sessionId });
    if (cart) {
      cart.items = [];
      cart.updatedAt = Date.now();
      await cart.save();
    }

    res.status(201).json({ message: "Order created and cart cleared", order });
  } catch (err) {
    console.error("Create order error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Get Order By ID
 * - Fetches a single order by ID
 * - Only the order owner or admin can view
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("products.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      order.user &&
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error("Get order error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Get All Orders
 * - Admin: fetches all orders
 * - User: fetches only their orders
 */
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
    console.error("Get all orders error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Update Order Status
 * - Admin updates the status of an order
 * - Valid statuses: processing, design, shipped, delivered
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: Admin access required" });
    }

    if (!["processing", "design", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Update order status error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Upload Delivered Image
 * - User uploads a proof image when they receive the product
 * - Only allowed if order is in "delivered" state
 */
export const uploadDeliveredImage = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No image uploaded" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const product = order.products.find(
      (item) => item.product.toString() === productId
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Save Cloudinary URL
    product.deliveredImage = file.path;
    await order.save();

    res
      .status(200)
      .json({ message: "Delivered image uploaded", deliveredImage: file.path });
  } catch (err) {
    console.error("Upload delivered image error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Confirm Delivered Image
 * - Admin approves or rejects the delivered image
 * - Updates product.deliveredImageStatus
 */
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

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const product = order.products.find(
      (item) => item.product.toString() === productId
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!product.deliveredImage) {
      return res.status(400).json({ message: "No delivered image to confirm" });
    }

    product.deliveredImageStatus = status;
    await order.save();

    res.status(200).json({ message: `Delivered image ${status}`, order });
  } catch (err) {
    console.error("Confirm delivered image error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Rate Product
 * - User rates a product (1–5 stars) after delivery is confirmed
 */
export const rateProduct = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const { rating } = req.body;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const product = order.products.find(
      (item) => item.product.toString() === productId
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

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
    console.error("Rate product error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Upload Shipping Slip Image
 * - Admin uploads a shipping slip for a product in an order
 */
export const uploadShippingSlipImage = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const file = req.file;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: Admin access required" });
    }

    if (!file) return res.status(400).json({ message: "No image uploaded" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const product = order.products.find(
      (item) => item.product.toString() === productId
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Save Cloudinary URL
    product.shippingSlipImage = file.path;
    await order.save();

    res.status(200).json({
      message: "Shipping slip uploaded",
      shippingSlipImage: file.path,
    });
  } catch (err) {
    console.error("Upload shipping slip error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import cloudinary from "../utils/cloudinary.js";
import crypto from "crypto";
import mongoose from "mongoose";
import Product from "../models/Product.js";

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
 * Create Order with Cash on Delivery (COD)
 */
export const createCODOrder = async (req, res) => {
  try {
    const { orderDetails } = req.body;
    if (!orderDetails) {
      return res.status(400).json({ message: "Order details are required" });
    }

    const order = new Order({
      user: req.user?._id || null,
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
      paymentMethod: "Cash on Delivery",
      paymentStatus: "pending", // COD is paid later
    });

    await order.save();

    // clear cart
    const sessionId = req.headers["x-session-id"];
    const userId = req.user?._id;
    let cart =
      (await Cart.findOne({ userId })) ||
      (sessionId ? await Cart.findOne({ sessionId }) : null);

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(201).json({ message: "COD order created", order });
  } catch (err) {
    console.error("COD Order Error:", err.message);
    res.status(500).json({ message: "Failed to create COD order" });
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
      // Users see only non-completed orders
      const orders = await Order.find({
        user: req.user._id,
        status: { $ne: "completed" },
      })
        .populate("user", "name email")
        .populate("products.product")
        .sort({ createdAt: -1 });

      return res.status(200).json(orders);
    }

    // Admins see all orders including completed
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

    // Save delivered image
    product.deliveredImage = file.path;

    // Update order status to delivered
    order.status = "delivered";

    // ✅ If payment method is COD and status is pending, mark it done
    if (
      order.paymentMethod === "Cash on Delivery" &&
      order.paymentStatus === "pending"
    ) {
      order.paymentStatus = "done";
    }

    await order.save();

    res.status(200).json({
      message:
        "Delivered image uploaded, order marked as delivered, payment updated if COD",
      deliveredImage: file.path,
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
    });
  } catch (err) {
    console.error("Upload delivered image error:", err.message);
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

    const productInOrder = order.products.find(
      (item) => item.product.toString() === productId
    );
    if (!productInOrder) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    if (productInOrder.rating) {
      return res
        .status(400)
        .json({ message: "Product already rated in this order" });
    }

    // Save rating in order
    productInOrder.rating = rating;

    // ✅ Update global product rating
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found in database" });
    }

    const currentAvg = product.rating.average || 0;
    const currentCount = product.rating.count || 0;
    const newCount = currentCount + 1;
    const newAvg = (currentAvg * currentCount + rating) / newCount;

    product.rating.average = newAvg;
    product.rating.count = newCount;

    await product.save();

    // ✅ Mark order as completed instead of deleting
    order.status = "completed";
    await order.save();

    res.status(200).json({
      message: "Rating submitted. Order marked as completed.",
      productRating: product.rating,
    });
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

    // Update order status to "shipped" if not already
    order.status = "shipped";

    await order.save();

    res.status(200).json({
      message: "Shipping slip uploaded and order status updated to shipped",
      shippingSlipImage: file.path,
      orderStatus: order.status,
    });
  } catch (err) {
    console.error("Upload shipping slip error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/orders/completed
export const getCompletedOrders = async (req, res) => {
  try {
    if (!req.user) {
      console.log("⚠️ No user in request");
      return res.status(401).json({ message: "Unauthorized - please log in" });
    }

    console.log("✅ User found:", req.user);

    let query = { status: { $in: ["delivered", "completed"] } };

    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }

    console.log("🔍 Completed Orders Query:", query);

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate({
        path: "products.product",
        model: "Product",
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 });

    console.log("✅ Orders fetched:", orders.length);

    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Get completed orders error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/orders/:orderId/cancel
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only allow cancel if order is still processing/design stage
    if (!["processing", "design"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled at this stage" });
    }

    order.status = "Cancel";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (err) {
    console.error("Cancel order error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/orders/cancelled
export const getCancelledOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - please log in" });
    }

    let query = { status: "cancel" };

    // Normal users can see only their own cancelled orders
    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

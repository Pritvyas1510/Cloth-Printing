import express from "express";
import Razorpay from "razorpay";
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();

const razorpayKey = process.env.RAZORPAY_KEY;
const razorpaySecret = process.env.RAZORPAY_SECRET;

if (!razorpayKey || !razorpaySecret) {
  throw new Error(
    "RAZORPAY_KEY or RAZORPAY_SECRET is not defined in environment variables."
  );
}

const razorpay = new Razorpay({
  key_id: razorpayKey,
  key_secret: razorpaySecret,
});

router.post("/create-payment", requireAuth, async (req, res) => {
  const { amount } = req.body;

  try {
    if (!amount || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const rupeeAmount = Number(amount);
    const paiseAmount = Math.round(rupeeAmount * 100);

    const options = {
      amount: paiseAmount,         // ✅ always integer
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Razorpay error:", {
      message: err.message,
      stack: err.stack,
      userId: req.user?._id,
      sessionId: req.headers["x-session-id"],
    });
    res.status(500).json({ message: "Payment creation failed", error: err.message });
  }
});


export default router;

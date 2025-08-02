import express from "express";
import Stripe from "stripe";
import requireAuth from "../middleware/authMiddleware.js";
import Product from "../models/Product.js"; // adjust path if needed

const router = express.Router();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables.");
}

const stripe = new Stripe(stripeSecretKey);

router.post("/create-checkout-session", requireAuth, async (req, res) => {
  const { products } = req.body;

  try {
    // Extract product IDs from the request
    const productIds = products.map((item) => item.productId);
    console.log(productIds);

    // Fetch all products from DB
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    // Check if all products exist
    if (dbProducts.length !== productIds.length) {
      return res.status(404).json({ message: "Some products do not exist." });
    }

    // Create a map for easy lookup
    const productMap = new Map();
    dbProducts.forEach((prod) => productMap.set(prod._id.toString(), prod));

    // Prepare Stripe line items
    const line_items = products.map((item) => {
      const product = productMap.get(item.productId);
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.title,
          },
          unit_amount: Math.round(product.price * 100), // Convert dollars to cents
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: "http://localhost:3000/payment-success",
      cancel_url: "http://localhost:3000/payment-cancelled",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ message: "Stripe checkout failed" });
  }
});


export default router;

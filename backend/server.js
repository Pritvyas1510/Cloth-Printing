// server.js
import express from "express";
import dotenv from "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import profileRoutes from "./routes/profileRoutes.js"; // Fixed typo: profileRoute to profileRoutes
import multer from "multer";

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());

// Enable CORS with credentials
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

// Serve static files for uploaded images
app.use("/uploads", express.static("Uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/profile", profileRoutes); // Fixed typo

// Global error-handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  }
  if (err.message.includes("Only image files")) {
    return res.status(400).json({ message: err.message });
  }
  console.error("Server error:", err.message);
  res.status(500).json({ message: "Server error", error: err.message });
});

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log(
        `Server running :- http://localhost:${process.env.PORT || 5000}`
      )
    );
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
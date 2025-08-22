import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import requireAuth from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify", requireAuth, async (req, res) => {
  try {
    console.log('Verify request - req.user:', req.user);
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "No user data in request" });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log('Fetched user:', user);
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Verify error:', err.message);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

export default router;
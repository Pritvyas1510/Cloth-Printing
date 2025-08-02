import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify", requireAuth, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
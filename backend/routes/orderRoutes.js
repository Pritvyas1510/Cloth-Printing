import express from "express";
import { placeOrder, getUserOrders } from "../controllers/orderController.js";
import requireAuth from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", requireAuth, placeOrder);
router.get("/", requireAuth, getUserOrders);

export default router;
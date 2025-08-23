import express from "express";
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  uploadDeliveredImage,
  confirmDeliveredImage,
  uploadDesignProofImage,
  uploadShippingSlipImage,
  verifyPayment,
} from "../controllers/orderController.js";
import requireAuth from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/", requireAuth, createOrder);
router.get("/", requireAuth, getAllOrders);
router.get("/:id", requireAuth, getOrderById);
router.put("/:id/status", requireAuth, updateOrderStatus);

router.post(
  "/:orderId/product/:productId/upload-delivered",
  requireAuth,
  upload.single("Cloth_Printing/deliveredImage"),
  uploadDeliveredImage
);

router.post(
  "/:orderId/product/:productId/confirm-delivered",
  requireAuth,
  confirmDeliveredImage
);

router.post(
  "/:orderId/product/:productId/upload-design",
  requireAuth,
  upload.single("designProofImage"),
  uploadDesignProofImage
);


router.post(
  "/:orderId/product/:productId/upload-shipping",
  requireAuth,
  upload.single("shippingSlipImage"),
  uploadShippingSlipImage
);

router.post("/verify", requireAuth, verifyPayment);

export default router;
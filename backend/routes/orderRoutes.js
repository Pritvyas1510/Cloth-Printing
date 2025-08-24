import express from "express";
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  uploadDeliveredImage,
  uploadDesignProofImage,
  uploadShippingSlipImage,
  verifyPayment,
  createCODOrder,
  rateProduct,
  getCompletedOrders,
  cancelOrder,
  getCancelledOrders,
} from "../controllers/orderController.js";
import requireAuth from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/", requireAuth, createOrder);
router.get("/completed", requireAuth, getCompletedOrders);
router.get("/", requireAuth, getAllOrders);
router.get("/:id", requireAuth, getOrderById);
router.put("/:id/status", requireAuth, updateOrderStatus);
router.post(
  "/:orderId/product/:productId/rate",
  requireAuth,
  rateProduct
);

router.post(
  "/:orderId/product/:productId/upload-delivered",
  requireAuth,
  upload.single("deliveredImage"),
  uploadDeliveredImage
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
// COD route
router.post("/cod", requireAuth, createCODOrder);

router.put("/:orderId/cancel", requireAuth, cancelOrder);
router.get("/cancelled", requireAuth, getCancelledOrders);


export default router;
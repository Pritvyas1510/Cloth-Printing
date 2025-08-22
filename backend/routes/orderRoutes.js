import express from 'express';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  uploadDeliveredImage,
  confirmDeliveredImage,
  rateProduct,
  verifyPayment,
} from '../controllers/orderController.js';
import requireAuth from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';

const router = express.Router();

router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, getAllOrders);
router.get('/:id', requireAuth, getOrderById);
router.put('/:id/status', requireAuth, updateOrderStatus);
router.post('/:orderId/product/:productId/upload-image', requireAuth, upload.single('deliveredImage'), uploadDeliveredImage);
router.post('/:orderId/product/:productId/confirm-image', requireAuth, confirmDeliveredImage);
router.post('/:orderId/product/:productId/rate', requireAuth, rateProduct);
router.post('/verify', requireAuth, verifyPayment);

export default router;
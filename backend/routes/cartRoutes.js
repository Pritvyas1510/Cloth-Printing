import express from 'express';
import multer from 'multer';
import { addToCart, getAllDesigns, updateCart, deleteCart, clearCart, getCart } from '../controllers/cartController.js';
import requireAuth from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure Multer for memory storage (buffer for Cloudinary stream)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/add', upload.single('customDesign'), addToCart);
router.get('/get',getCart );
router.get('/designs', getAllDesigns); // Admin endpoint to view all designs
router.put('/update', upload.single('customDesign'), updateCart);
router.delete('/delete', deleteCart);
router.delete("/clear", clearCart);


export default router;
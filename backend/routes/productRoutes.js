import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import requireAuth from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// GET all products
router.get("/", getProducts);

// GET single product by ID
router.get("/:id", getProductById);

// ==================== PROTECTED ROUTES ====================
// CREATE new product (requires auth)
router.post("/", requireAuth, upload.array("images", 5), createProduct);

// UPDATE product by ID (requires auth)
router.put("/:id", requireAuth, upload.array("images", 5), updateProduct);

// DELETE product by ID (requires auth)
router.delete("/:id", requireAuth, deleteProduct);

export default router;
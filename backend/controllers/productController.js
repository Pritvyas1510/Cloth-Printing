import Product from "../models/Product.js";

// ========== CREATE PRODUCT ==========
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      size,
      color,
      category,
      material,
      stockQuantity,
      discount,
      brand,
      weight,
      dimensions,
      specifications,
      tags,
    } = req.body;

    // Validate required fields
    if (!title || !price || !category || !stockQuantity || !req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Title, price, category, stock quantity, and at least one image are required" });
    }

    // Convert size, color, and tags to arrays if they are strings
    const sizesArray = Array.isArray(size) ? size : size ? size.split(",").map(s => s.trim()) : [];
    const colorsArray = Array.isArray(color) ? color : color ? color.split(",").map(c => c.trim()) : [];
    const tagsArray = Array.isArray(tags) ? tags : tags ? tags.split(",").map(t => t.trim()) : [];

    // Parse dimensions if provided
    let parsedDimensions = {};
    if (dimensions) {
      try {
        parsedDimensions = typeof dimensions === 'string' ? JSON.parse(dimensions) : dimensions;
      } catch (error) {
        return res.status(400).json({ message: "Invalid dimensions format" });
      }
    }

    // Parse specifications if provided
    let parsedSpecifications = {};
    if (specifications) {
      try {
        parsedSpecifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (error) {
        return res.status(400).json({ message: "Invalid specifications format" });
      }
    }

    // Get array of image paths from multer
    const imagePaths = req.files.map((file) => file.path);

    const newProduct = new Product({
      title,
      description: description || "",
      price,
      size: sizesArray,
      color: colorsArray,
      images: imagePaths,
      createdBy: req.user.id,
      category,
      material: material || "",
      stockQuantity,
      discount: discount || 0,
      brand: brand || "",
      weight: weight || 0,
      dimensions: parsedDimensions,
      specifications: parsedSpecifications,
      tags: tagsArray,
      isActive: true,
      rating: { average: 0, count: 0 },
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Create Product Error:", error.message);
    res.status(500).json({ message: "Server error while creating product" });
  }
};

// ========== GET ALL PRODUCTS ==========
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Get Products Error:", error.message);
    res.status(500).json({ message: "Error fetching products" });
  }
};

// ========== GET PRODUCT BY ID ==========
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Get Product Error:", error.message);
    res.status(500).json({ message: "Error fetching product" });
  }
};

// ========== UPDATE PRODUCT ==========
export const updateProduct = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only can update products" });
    }

    const updates = { ...req.body };
    
    // Handle file uploads
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((file) => file.path);
    }

    // Convert size, color, and tags to arrays if needed
    if (updates.size) {
      updates.size = Array.isArray(updates.size) ? updates.size : updates.size.split(",").map(s => s.trim());
    }
    if (updates.color) {
      updates.color = Array.isArray(updates.color) ? updates.color : updates.color.split(",").map(c => c.trim());
    }
    if (updates.tags) {
      updates.tags = Array.isArray(updates.tags) ? updates.tags : updates.tags.split(",").map(t => t.trim());
    }

    // Parse dimensions if provided
    if (updates.dimensions) {
      try {
        updates.dimensions = typeof updates.dimensions === 'string' ? JSON.parse(updates.dimensions) : updates.dimensions;
      } catch (error) {
        return res.status(400).json({ message: "Invalid dimensions format" });
      }
    }

    // Parse specifications if provided
    if (updates.specifications) {
      try {
        updates.specifications = typeof updates.specifications === 'string' ? JSON.parse(updates.specifications) : updates.specifications;
      } catch (error) {
        return res.status(400).json({ message: "Invalid specifications format" });
      }
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Product not found to update" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update Product Error:", error.message);
    res.status(500).json({ message: "Error updating product" });
  }
};

// ========== DELETE PRODUCT ==========
export const deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only can delete products" });
    }

    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found to delete" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete Product Error:", error.message);
    res.status(500).json({ message: "Error deleting product" });
  }
};
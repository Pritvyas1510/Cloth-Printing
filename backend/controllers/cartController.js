import Cart from "../models/Cart.js";
import cloudinary from "../utils/cloudinary.js";
import { Readable } from "stream";
import mongoose from "mongoose";

export const addToCart = async (req, res) => {
  const {
    productId,
    title,
    price,
    color,
    size,
    quantity = 1,
    designDescription,
  } = req.body;

  const sessionId = req.headers["x-session-id"];
  if (!sessionId) {
    return res.status(400).json({ message: "Missing sessionId" });
  }

  let customDesign = null;

  try {
    // Validate
    if (!productId || !title || !price || !color || !size) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Upload custom design (if provided)
    if (req.file && req.file.mimetype.startsWith("image/")) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "custom_designs", timeout: 30000 },
          (error, result) => (error ? reject(error) : resolve(result.public_id))
        );
        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(stream);
      });
      customDesign = uploadResult;
    }

    let cart;

    // 1️⃣  If authenticated -> try to load user cart
    if (req.user && req.user._id) {
      cart = await Cart.findOne({ userId: req.user._id });

      // Migrate existing guest cart into user cart (only ONCE)
      if (!cart) {
        // no userCart yet
        const guestCart = await Cart.findOne({ sessionId });
        if (guestCart) {
          guestCart.userId = req.user._id;
          guestCart.sessionId = undefined;
          await guestCart.save();
          cart = guestCart;
        } else {
          // create a fresh user cart
          cart = await Cart.create({ userId: req.user._id, items: [] });
        }
      }
    }

    // 2️⃣  Guest user
    if (!cart) {
      cart = await Cart.findOne({ sessionId });
      if (!cart) {
        cart = await Cart.create({ sessionId, items: [] });
      }
    }

    // Add or update item
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.color === color &&
        item.size === size
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += parseInt(quantity);
      if (designDescription) {
        cart.items[itemIndex].designDescription = designDescription;
      }
      if (customDesign) {
        cart.items[itemIndex].customDesign = customDesign;
      }
    } else {
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        title,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        color,
        size,
        designDescription,
        customDesign,
      });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    console.error("Error adding to cart:", error.message);
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
};


// cartController.js (fixed getCart)
export const getCart = async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"];
    const userId = req.user?._id;

    if (!sessionId && !userId) {
      return res.status(400).json({ message: "Missing sessionId" });
    }

    let cart = null;

    if (userId) {
      // try to load the user cart
      cart = await Cart.findOne({ userId }).populate("items.productId");

      // if it doesn't exist yet, migrate guest cart if present
      if (!cart && sessionId) {
        const guestCart = await Cart.findOne({ sessionId });
        if (guestCart) {
          guestCart.userId = userId;
          guestCart.sessionId = undefined;
          await guestCart.save();
          cart = await Cart.findOne({ userId }).populate("items.productId");
        }
      }

      // if no cart exists for user AND no guest cart → create one
      if (!cart) {
        cart = await Cart.create({ userId, items: [] });
      }
    }

    // Guest
    if (!cart) {
      cart = await Cart.findOne({ sessionId }).populate("items.productId");
      if (!cart) {
        cart = await Cart.create({ sessionId, items: [] });
      }
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error.message);
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};


export const getAllDesigns = async (req, res) => {
  try {
    const carts = await Cart.find();
    const allDesigns = carts.flatMap((cart) =>
      cart.items
        .filter((item) => item.customDesign)
        .map((item) => ({
          userId: cart.userId,
          sessionId: cart.sessionId,
          productId: item.productId,
          title: item.title,
          color: item.color,
          size: item.size,
          customDesign: cloudinary.url(item.customDesign, { secure: true }),
          designDescription: item.designDescription,
        }))
    );
    res.status(200).json(allDesigns);
  } catch (error) {
    console.error("Error fetching designs:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching designs", error: error.message });
  }
};

export const updateCart = async (req, res) => {
  const {
    productId,
    color,
    size,
    quantity,
    newColor,
    newSize,
    designDescription,
  } = req.body;
  let customDesign = null;

  try {
    // Validate productId
    if (productId && !mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    let cart;
    if (req.user && req.user._id) {
      cart = await Cart.findOne({ userId: req.user._id });
    } else if (req.headers["x-session-id"]) {
      const sessionId = req.headers["x-session-id"];
      cart = await Cart.findOne({ sessionId });
    } else {
      return res
        .status(400)
        .json({ message: "No user or session ID provided" });
    }

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.color === color &&
        item.size === size
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Handle Cloudinary upload for custom design
    if (req.file && req.file.mimetype.startsWith("image/")) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "custom_designs", timeout: 30000 },
          (error, result) => (error ? reject(error) : resolve(result.public_id))
        );
        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(stream);
        setTimeout(
          () => reject(new Error("Cloudinary upload timed out")),
          30000
        );
      });
      if (cart.items[itemIndex].customDesign) {
        await cloudinary.uploader
          .destroy(cart.items[itemIndex].customDesign)
          .catch((err) =>
            console.warn(
              `Failed to delete old image ${cart.items[itemIndex].customDesign}:`,
              err
            )
          );
      }
      customDesign = uploadResult;
    }

    // Update item
    const item = cart.items[itemIndex];
    item.set({
      quantity: quantity ? parseInt(quantity) : item.quantity,
      color: newColor || item.color,
      size: newSize || item.size,
      customDesign: customDesign || item.customDesign,
      designDescription: designDescription || item.designDescription,
    });

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (error) {
    console.error("Error updating cart:", error.message);
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
};

export const deleteCart = async (req, res) => {
  const { productId, color, size, clearAll } = req.body;

  try {
    // Validate productId if provided
    if (productId && !mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    let cart;
    if (req.user && req.user._id) {
      cart = await Cart.findOne({ userId: req.user._id });
    } else if (req.headers["x-session-id"]) {
      const sessionId = req.headers["x-session-id"];
      cart = await Cart.findOne({ sessionId });
    } else {
      return res
        .status(400)
        .json({ message: "No user or session ID provided" });
    }

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (clearAll) {
      for (const item of cart.items) {
        if (item.customDesign) {
          await cloudinary.uploader
            .destroy(item.customDesign)
            .catch((err) =>
              console.warn(`Failed to delete image ${item.customDesign}:`, err)
            );
        }
      }
      await Cart.deleteOne({ userId: cart.userId, sessionId: cart.sessionId });
      return res.status(200).json({ message: "Cart cleared successfully" });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.color === color &&
        item.size === size
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (cart.items[itemIndex].customDesign) {
      await cloudinary.uploader
        .destroy(cart.items[itemIndex].customDesign)
        .catch((err) =>
          console.warn(
            `Failed to delete image ${cart.items[itemIndex].customDesign}:`,
            err
          )
        );
    }

    cart.items.splice(itemIndex, 1);
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    console.error("Error deleting from cart:", error.message);
    res
      .status(500)
      .json({ message: "Error deleting from cart", error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"];
    const userId = req.user?._id;
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
      if (!cart && sessionId) {
        const guestCart = await Cart.findOne({ sessionId });
        if (guestCart) {
          guestCart.userId = userId;
          guestCart.sessionId = null;
          await guestCart.save();
          cart = await Cart.findOne({ userId });
        }
      }
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    for (const item of cart.items) {
      if (item.customDesign) {
        await cloudinary.uploader
          .destroy(item.customDesign)
          .catch((err) =>
            console.warn(`Failed to delete image ${item.customDesign}:`, err)
          );
      }
    }
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("Clear cart error:", err);
    res
      .status(500)
      .json({ message: "Failed to clear cart", error: err.message });
  }
};

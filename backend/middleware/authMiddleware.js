import jwt from "jsonwebtoken";
import dotenv from "dotenv/config";

const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    
    console.log('Token received in middleware:', token ? 'Present' : 'Missing');
    if (!token) {
      req.user = null; // Allow guest access
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Decoded token:', decoded);
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      throw new Error("Invalid token payload");
    }
    console.log("decoded :-  ",decoded.id);
    
    req.user = {
      _id: decoded.id,
      role: decoded.role || "user",
    };
    // console.log('req.user set:', req.user);


    next();
  } catch (error) {
    console.error("Authentication error:", error.message, 'Token:', token ? 'Present' : 'Missing');
    let message = "Unauthorized: Invalid token";
    if (error.name === "TokenExpiredError") {
      message = "Unauthorized: Token has expired";
    } else if (error.message.includes("invalid signature")) {
      message = "Unauthorized: Invalid token signature";
    }
    return res.status(401).json({ message });
  }
};

export default requireAuth;
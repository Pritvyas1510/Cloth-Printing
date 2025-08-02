import jwt from "jsonwebtoken";
import dotenv from "dotenv/config";

const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      throw new Error("Invalid token payload");
    }

    // Assign user data to request object
    req.user = {
      id: decoded.id,
      role: decoded.role || "user",
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
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
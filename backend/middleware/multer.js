import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js"; // 👈 import your cloudinary config

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "Cloth_Printing", // 👈 your Cloudinary folder
      allowed_formats: [
        "jpeg",
        "jpg",
        "png",
        "gif",
        "svg",
        "webp",
        "bmp",
        "tiff",
        "jfif",
      ],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`, // custom filename
    };
  },
});

// File filter for images (same as before)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|svg|webp|bmp|tiff|jfif/;
  const extname = filetypes.test(
    file.originalname.split(".").pop().toLowerCase()
  );
  const mimetype = filetypes.test(file.mimetype.split("/")[1].toLowerCase());
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image files (JPEG, JPG, PNG, GIF, SVG, WebP, BMP, TIFF, JFIF) are allowed"
      )
    );
  }
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export default upload;

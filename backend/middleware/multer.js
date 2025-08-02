import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure Uploads directory exists
const uploadDir = 'Uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Uploads directory created');
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use uploadDir variable
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|svg|webp|bmp|tiff|jfif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype.split('/')[1].toLowerCase());
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, SVG, WebP, BMP, TIFF, JFIF) are allowed'));
  }
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
});

export default upload;
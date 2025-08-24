import React, { useState, useRef, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "../../../Axios/AxiosInstance";
import "react-toastify/dist/ReactToastify.css";
import { Star } from "lucide-react";
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dopqalob9/image/upload";

const Deliver = ({ orderId, product, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [rating, setRating] = useState(0);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const productId =
    typeof product.product === "object"
      ? product.product._id.toString()
      : product.product.toString();

  // Handle file selection and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only images are allowed.");
      return;
    }

    // Set preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) return toast.error("Please select an image to upload.");
    if (!file.type.startsWith("image/"))
      return toast.error("Only images are allowed.");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("deliveredImage", file); // must match upload.single("deliveredImage")

      await axios.post(
        `/api/orders/${orderId}/product/${productId}/upload-delivered`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Delivery proof uploaded successfully!");
      setUploaded(true);
      setPreview(null);
    } catch (err) {
      toast.error(
        `Upload failed: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a valid rating (1-5).");
      return;
    }

    try {
      await axios.post(
        `/api/orders/${orderId}/product/${productId}/rate`,
        { rating },
        { withCredentials: true }
      );
      toast.success("Rating submitted successfully!");
      onClose();
    } catch (err) {
      toast.error(
        `Rating failed: ${err.response?.data?.message || err.message}`
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-2xl p-6 relative animate-slide-in">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Deliver Product
        </h2>

        <div className="gap-6">
          {/* Left Column: Product Info */}
          <div className="bg-gray-50 p-4 rounded-xl flex flex-row items-center gap-5 mx-10 shadow-sm">
            <div>
              <img
                src={
                  product?.product?.images?.[0]?.startsWith("http")
                    ? product.product.images[0]
                    : `${CLOUDINARY_BASE_URL}/${product.product.images?.[0]}`
                }
                alt={product.title}
                className="w-40 object-cover rounded-lg mb-4 border border-gray-200"
              />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-medium text-lg text-black">{product.title}</h3>
              <p className="text-gray-600 text-sm">
                Color: {product.color || "N/A"}
              </p>
              <p className="text-gray-600 text-sm">
                Size: {product.size || "N/A"}
              </p>
              <p className="text-gray-600 text-sm">
                Quantity: {product.quantity}
              </p>
              <p className="text-gray-600 text-sm">Price: ₹{product.price}</p>
              {product.designDescription && (
                <p className="text-gray-600 text-sm">
                  Description: {product.designDescription}
                </p>
              )}
            </div>
            <div>
              {product.customDesign ? (
                <img
                  src={`${CLOUDINARY_BASE_URL}/${product.customDesign}`}
                  alt="Custom Design"
                  className="w-40 object-cover rounded-lg mb-4 border border-gray-200"
                />
              ) : (
                <p className="text-sm text-gray-500 mb-2">No custom design</p>
              )}
            </div>
          </div>

          {/* Right Column: Upload / Rating */}
          <div className="flex flex-col my-10 justify-self-center gap-4 p-4 bg-gray-50 rounded-xl shadow-sm">
            {!uploaded ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="border border-gray-300 text-black p-2 rounded-md w-full"
                />
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-md border border-gray-300 mt-2"
                  />
                )}
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`w-full py-2 rounded-md font-medium text-white ${
                    uploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } transition-all`}
                >
                  {uploading ? "Uploading..." : "Upload Delivery Proof"}
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-700 font-medium text-center mb-2">
                  Rate this product:
                </p>

                {/* ⭐ Star Rating UI */}
                <div className="flex justify-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Star
                      key={num}
                      size={32}
                      onClick={() => setRating(num)}
                      className={`cursor-pointer transition-colors ${
                        num <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleRatingSubmit}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium transition-all"
                >
                  Submit Rating
                </button>
              </>
            )}
          </div>
        </div>
        <ToastContainer
          position="bottom-left"
          autoClose={2000}
          hideProgressBar={true}
        />
      </div>
    </div>
  );
};

export default Deliver;

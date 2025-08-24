import React, { useState, useEffect } from "react";
import AxiosInstance from "../../../Axios/AxiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ShippedDetails = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [product, setProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_BACKEND_URI || "http://localhost:5000";
  const CLOUDINARY_BASE_URL =
    "https://res.cloudinary.com/dopqalob9/image/upload";
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Fetch order + product
  useEffect(() => {
    const fetchOrderAndProduct = async () => {
      try {
        const orderResponse = await AxiosInstance.get(
          `/api/orders/${orderId}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const orderData = orderResponse.data;
        setOrder(orderData);

        if (orderData.products && orderData.products.length > 0) {
          const firstProduct = orderData.products[0];
          const productId =
            typeof firstProduct.product === "object" &&
            firstProduct.product?._id
              ? firstProduct.product._id.toString()
              : firstProduct.product.toString();
          setSelectedProductId(productId);

          const productResponse = await AxiosInstance.get(
            `/api/products/${productId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ).catch(() => ({ data: null }));

          setProduct({
            ...firstProduct,
            additionalDetails: productResponse.data || {},
            shippedProof: firstProduct.shippedProof || null,
            designProof: firstProduct.designProof || null, // Added designProof
          });

          if (firstProduct.shippedProof) {
            setImagePreview(
              firstProduct.shippedProof.startsWith("http")
                ? firstProduct.shippedProof
                : `${CLOUDINARY_BASE_URL}/${firstProduct.shippedProof}`
            );
          }
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch order or product details");
        setLoading(false);
      }
    };

    fetchOrderAndProduct();
  }, [orderId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        return toast.error("Only JPG/PNG allowed");
      }
      if (file.size > MAX_FILE_SIZE) {
        return toast.error("Image size exceeds 5MB");
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Submit shipped proof (shipping slip)
const handleSubmit = async () => {
  if (!imageFile || !selectedProductId) {
    return toast.error("Please select product & upload an image");
  }
  setUploading(true);
  try {
    const formData = new FormData();
    formData.append("shippingSlipImage", imageFile); // match backend field name

    // Call backend upload API
    await AxiosInstance.post(
      `/api/orders/${orderId}/product/${selectedProductId}/upload-shipping`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    toast.success("Shipping slip uploaded successfully");

    // Update local state to show the uploaded image immediately
    setProduct((prev) => ({
      ...prev,
      shippingSlipImage: URL.createObjectURL(imageFile),
    }));

    setTimeout(onClose, 2000);
  } catch (err) {
    console.error(err);
    toast.error("Upload failed");
  } finally {
    setUploading(false);
  }
};


  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
        <div className="animate-spin h-10 w-10 border-4 border-t-blue-600 border-gray-200 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto bg-gray-100">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl p-6 min-h-[80vh] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
        >
          ✕
        </button>

        <h1 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Shipped Proof – Order {order._id.slice(10)}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Product & Order Summary */}
          <div className="space-y-4">
            {product && (
              <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    {product.additionalDetails?.images?.[0] ? (
                      <img
                        src={
                          product.additionalDetails.images[0].startsWith("http")
                            ? product.additionalDetails.images[0]
                            : `${BASE_URL}/${product.additionalDetails.images[0]}`
                        }
                        alt={product.title}
                        className="w-20 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="w-20 flex items-center justify-center bg-gray-100 rounded-md border text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 flex flex-row justify-between">
                    <div className="text-sm text-gray-700 space-y-1">
                      <h2 className="text-base font-semibold text-gray-800">
                        {product.title}
                      </h2>
                      <p><span className="font-medium">Color:</span> {product.color}</p>
                      <p><span className="font-medium">Size:</span> {product.size}</p>
                      <p><span className="font-medium">Quantity:</span> {product.quantity}</p>
                      <p><span className="font-medium">Price:</span> ₹{product.price}</p>
                      {product.designDescription && (
                        <p className="text-xs">
                          <span className="font-medium">Description:</span> {product.designDescription}
                        </p>
                      )}
                    </div>
                    {product.shippedProof && (
                      <div className="mt-3">
                        <img
                          src={product.shippedProof.startsWith("http")
                            ? product.shippedProof
                            : `${CLOUDINARY_BASE_URL}/${product.shippedProof}`}
                          alt="Shipped Proof"
                          className="w-20 h-20 object-cover rounded-md border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order summary */}
            <div className="border rounded-lg p-4 bg-gray-50 shadow-sm text-sm text-gray-700">
              <h3 className="text-base font-semibold mb-2">Order Summary</h3>
              <div className="grid grid-cols-2 gap-y-1">
                <p><span className="font-medium">Order ID:</span> {order._id.slice(-6)}</p>
                <p><span className="font-medium">Placed on:</span> {new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                <p><span className="font-medium">Total:</span> ₹{order.totalAmount}</p>
                <p><span className="font-medium">Payment:</span> {order.paymentMethod} ({order.paymentStatus})</p>
              </div>

              
            </div>
          </div>

          {/* Right: Upload area */}
          <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
            <h3 className="text-base font-semibold mb-3">Upload Shipped Proof</h3>
            {!imagePreview ? (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition h-48"
              >
                <p className="text-gray-500 text-sm font-medium">Drag & drop or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  id="image-upload"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative w-full h-48">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg border"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition"
                >
                  ✕
                </button>
                <p className="mt-2 text-center text-xs text-gray-600">
                  {imageFile?.name} ({(imageFile?.size / 1024).toFixed(1)} KB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !imageFile}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {uploading ? "Uploading..." : "Submit Proof"}
          </button>
        </div>

        <ToastContainer position="bottom-left" autoClose={2000}   hideProgressBar={true} />
      </div>
    </div>
  );
};

export default ShippedDetails;

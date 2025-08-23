import React, { useState, useEffect } from "react";
import AxiosInstance from "../../../Axios/AxiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderDesign = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [product, setProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = import.meta.env.VITE_BACKEND_URI || "http://localhost:5000";
  const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/das7xphnt/image/upload";
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    const fetchOrderAndProduct = async () => {
      try {
        if (!orderId) {
          throw new Error("Order ID is missing");
        }
        console.log("Fetching order with ID:", orderId);

        const orderResponse = await AxiosInstance.get(
          `/api/orders/${orderId}`,
          {
            withCredentials: true,
            headers: {
              "x-session-id":
                localStorage.getItem("sessionId") ||
                `guest_${Math.random().toString(36).substr(2, 9)}`,
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const orderData = orderResponse.data;
        console.log("Fetched order:", orderData);
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
          console.log("Fetched product:", productResponse.data);
          setProduct({
            ...firstProduct,
            additionalDetails: productResponse.data || {},
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err.response?.data || err.message);
        setError(
          err.response?.data?.message ||
            "Failed to fetch order or product details"
        );
        setLoading(false);
        toast.error(
          err.response?.data?.message ||
            "Failed to fetch order or product details",
          {
            position: "top-left",
          }
        );
      }
    };

    fetchOrderAndProduct();
  }, [orderId]);

  const handleProductSelect = async (productId) => {
    try {
      setSelectedProductId(productId);
      const productItem = order.products.find(
        (item) =>
          (typeof item.product === "object" && item.product?._id
            ? item.product._id.toString()
            : item.product.toString()) === productId
      );
      if (!productItem) {
        throw new Error("Product not found in order");
      }

      const productResponse = await AxiosInstance.get(
        `/api/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      ).catch(() => ({ data: null }));
      console.log("Fetched product:", productResponse.data);
      setProduct({
        ...productItem,
        additionalDetails: productResponse.data || {},
      });
    } catch (err) {
      toast.error("Failed to load product details", { position: "top-left" });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (JPG, PNG)", {
          position: "top-left",
        });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Image size exceeds 5MB limit", { position: "top-left" });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      console.log("Selected file:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

const handleSubmit = async () => {
  if (!imageFile || !selectedProductId) {
    toast.error("Please select a product and upload an image", {
      position: "top-left",
    });
    return;
  }

  setUploading(true);
  try {
    const formData = new FormData();
    formData.append("designProofImage", imageFile);

    console.log("Submitting form data:", {
      orderId,
      productId: selectedProductId,
      file: {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
      },
    });

    // Log FormData entries for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`FormData entry: ${key}=`, value);
    }

    const response = await AxiosInstance.post(
      `/api/orders/${orderId}/product/${selectedProductId}/upload-design`,
      formData,
      {
        withCredentials: true,
        headers: {
          "x-session-id":
            localStorage.getItem("sessionId") ||
            `guest_${Math.random().toString(36).substr(2, 9)}`,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data", // Explicitly set
        },
      }
    );

    console.log("Upload response:", response.data);
    toast.success("Design proof uploaded successfully", {
      position: "top-left",
    });
    setTimeout(onClose, 2000); // Close after 2 seconds
  } catch (err) {
    console.error("Submit error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    toast.error(
      err.response?.data?.message || "Failed to upload design proof",
      {
        position: "top-left",
      }
    );
  } finally {
    setUploading(false);
  }
};

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
          <p className="text-red-600 text-lg font-medium text-center mb-4">
            {error}
          </p>
          <button
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2 px-4 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
          <p className="text-gray-600 text-lg font-medium text-center mb-4">
            Order not found.
          </p>
          <button
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2 px-4 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-3xl w-full max-h-[110vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-all duration-300"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">
          Design for Order #{order._id.slice(-6)}
        </h1>

        {product ? (
          <div className="flex flex-row sm:flex-row gap-6 mb-6">
            <div className="flex flex-row gap-4">
              <div>
                {product.additionalDetails?.images?.[0] ? (
                  <img
                    src={`${BASE_URL}/${product.additionalDetails.images[0]}`}
                    alt={product.title}
                    className="w-28 object-cover rounded-lg shadow-sm"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/150")
                    }
                  />
                ) : (
                  <div className="w-28 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex-1 mx-20">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {product.title}
                </h2>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Color:</span>{" "}
                    {product.color || "Not specified"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Size:</span>{" "}
                    {product.size || "Not specified"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Quantity:</span>{" "}
                    {product.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Price:</span>{" "}
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(product.price)}
                  </p>
                  {product.designDescription && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Design Description:</span>{" "}
                      {product.designDescription}
                    </p>
                  )}
                  {product.deliveredImage && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">
                        Delivered Image Status:
                      </span>{" "}
                      {product.deliveredImageStatus.charAt(0).toUpperCase() +
                        product.deliveredImageStatus.slice(1)}
                    </p>
                  )}
                  {product.rating && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Rating:</span>{" "}
                      {product.rating} Star{product.rating > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
              {product.customDesign && (
                <div>
                  <img
                    src={
                      product.customDesign.startsWith("http")
                        ? product.customDesign
                        : `${CLOUDINARY_BASE_URL}/${product.customDesign}`
                    }
                    alt="Custom Design"
                    className="w-28 object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      console.error(
                        `Failed to load custom design image: ${product.customDesign}`
                      );
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-sm text-center mb-6">
            Please select a product to view its design details.
          </p>
        )}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Order Summary
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Order ID:</span> {order._id}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Placed on:</span>{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Total Amount:</span>{" "}
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(order.totalAmount)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Payment Method:</span>{" "}
              {order.paymentMethod}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Payment Status:</span>{" "}
              {order.paymentStatus.charAt(0).toUpperCase() +
                order.paymentStatus.slice(1)}
            </p>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Upload Design Proof
          </h3>
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-300 ${
              imagePreview
                ? "border-blue-600"
                : "border-gray-300 hover:border-blue-600"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith("image/")) {
                if (file.size > MAX_FILE_SIZE) {
                  toast.error("Image size exceeds 5MB limit", {
                    position: "top-left",
                  });
                  return;
                }
                setImageFile(file);
                const reader = new FileReader();
                reader.onloadend = () => setImagePreview(reader.result);
                reader.readAsDataURL(file);
                console.log("Dropped file:", {
                  name: file.name,
                  size: file.size,
                  type: file.type,
                });
              } else {
                toast.error("Please drop an image file (JPG, PNG)", {
                  position: "top-left",
                });
              }
            }}
          >
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
              aria-label="Upload design proof image"
            />
            <label
              htmlFor="image-upload"
              className="block text-sm text-gray-500 cursor-pointer"
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Design Proof Preview"
                    className="w-64 h-64 object-cover rounded-lg mx-auto"
                  />
                  <button
                    className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-300"
                    onClick={handleRemoveImage}
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                  <p className="mt-2 text-sm text-gray-600">
                    {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500">
                    Drag and drop an image here, or click to select
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supported formats: JPG, PNG (Max 5MB)
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4 mb-6">
          <button
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2 px-6 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
            onClick={onClose}
            aria-label="Cancel upload"
          >
            Cancel
          </button>
          <button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={uploading || !imageFile || !selectedProductId}
            aria-label="Submit design proof"
          >
            {uploading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </span>
            ) : (
              "Submit Design"
            )}
          </button>
        </div>

        <ToastContainer position="top-left" autoClose={3000} />
      </div>
    </div>
  );
};

export default OrderDesign;
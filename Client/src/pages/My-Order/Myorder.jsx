import React, { useState, useEffect, useRef } from "react";
import axios from "../../Axios/AxiosInstance";
import { useAuth } from "../../AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Deliver from "./Deliver/Deliver";

const Myorder = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState({});
  const [ratings, setRatings] = useState({});
  const [modalData, setModalData] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);

  const fileInputRefs = useRef({});
  const navigate = useNavigate();
  const CLOUDINARY_BASE_URL =
    "https://res.cloudinary.com/dopqalob9/image/upload";
  const BASE_URL = import.meta.env.VITE_BACKEND_URI;

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setError("Please log in to view your orders");
      setLoading(false);
      navigate("/login");
      return;
    }

    const fetchOrdersAndProducts = async () => {
      try {
        const response = await axios.get("/api/orders", {
          withCredentials: true,
          headers: {
            "x-session-id":
              localStorage.getItem("sessionId") ||
              `guest_${Math.random().toString(36).substr(2, 9)}`,
          },
        });
        const ordersData = Array.isArray(response.data) ? response.data : [];
        setOrders(ordersData);

        const productIds = [
          ...new Set(
            ordersData.flatMap((order) =>
              order.products.map((item) =>
                typeof item.product === "object" && item.product?._id
                  ? item.product._id.toString()
                  : item.product.toString()
              )
            )
          ),
        ];

        const productPromises = productIds.map((id) =>
          axios.get(`/api/products/${id}`).catch(() => ({ data: null }))
        );
        const productResponses = await Promise.all(productPromises);
        const productMap = {};
        productResponses.forEach((res) => {
          if (res.data) {
            productMap[res.data._id] = res.data;
          }
        });
        setProducts(productMap);
        setLoading(false);
      } catch (err) {
        console.error("Fetch orders error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to fetch orders");
        setOrders([]);
        setLoading(false);
      }
    };

    fetchOrdersAndProducts();
  }, [isAuthenticated, authLoading, navigate]);

  const handleImageUpload = async (orderId, productId) => {
    const file = fileInputRefs.current[`${orderId}-${productId}`]?.files[0];
    if (!file) {
      toast.error("Please select an image to upload.", {
        position: "top-left",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.", { position: "top-left" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.", {
        position: "top-left",
      });
      return;
    }

    setUploading((prev) => ({ ...prev, [`${orderId}-${productId}`]: true }));

    try {
      const formData = new FormData();
      formData.append("deliveredImage", file);
      const response = await axios.post(
        `/api/orders/${orderId}/product/${productId}/upload-image`,
        formData,
        {
          headers: {
            "x-session-id": localStorage.getItem("sessionId"),
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      toast.success(
        "Image uploaded successfully, awaiting admin confirmation.",
        { position: "top-left" }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                products: order.products.map((item) =>
                  (typeof item.product === "object"
                    ? item.product._id.toString()
                    : item.product.toString()) === productId
                    ? {
                        ...item,
                        deliveredImage: response.data.deliveredImage,
                        deliveredImageStatus: "pending",
                      }
                    : item
                ),
              }
            : order
        )
      );
      fileInputRefs.current[`${orderId}-${productId}`].value = null;
    } catch (err) {
      console.error("Image upload error:", err.response?.data || err.message);
      toast.error(
        `Failed to upload image: ${err.response?.data?.message || err.message}`,
        { position: "top-left" }
      );
    } finally {
      setUploading((prev) => ({ ...prev, [`${orderId}-${productId}`]: false }));
    }
  };

  const handleRatingSubmit = async (orderId, productId, rating) => {
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a valid rating (1-5).", {
        position: "top-left",
      });
      return;
    }

    try {
      const response = await axios.post(
        `/api/orders/${orderId}/product/${productId}/rate`,
        { rating },
        {
          headers: { "x-session-id": localStorage.getItem("sessionId") },
          withCredentials: true,
        }
      );
      toast.success("Rating submitted successfully!", { position: "top-left" });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                products: order.products.map((item) =>
                  (typeof item.product === "object"
                    ? item.product._id.toString()
                    : item.product.toString()) === productId
                    ? { ...item, rating: response.data.rating }
                    : item
                ),
              }
            : order
        )
      );
    } catch (err) {
      console.error(
        "Rating submission error:",
        err.response?.data || err.message
      );
      toast.error(
        `Failed to submit rating: ${
          err.response?.data?.message || err.message
        }`,
        { position: "top-left" }
      );
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await axios.put(
        `/api/orders/${orderId}/cancel`,
        {},
        {
          headers: { "x-session-id": localStorage.getItem("sessionId") },
          withCredentials: true,
        }
      );

      toast.success("Order cancelled successfully!", { position: "top-left" });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: "Cancel" } : order
        )
      );
    } catch (err) {
      console.error("Cancel order error:", err.response?.data || err.message);
      toast.error(
        `Failed to cancel order: ${err.response?.data?.message || err.message}`,
        { position: "top-left" }
      );
    }
  };

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    completed: "bg-green-200 text-green-900",
    cancel: "bg-red-100 text-red-800",
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>
      <div className="space-y-6">
        {orders
          .filter((order) => order.status.toLowerCase() !== "cancel") // hide cancelled orders
          .map((order) => (
            <div
              key={order._id}
              className="bg-white shadow-lg rounded-lg p-6 border border-gray-200"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Order {`${order._id}`.slice(10)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusStyles[order.status.toLowerCase()] ||
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Order Progress Bar */}
              <div className="relative mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 font-medium">
                    Expected Arrival:{" "}
                    {new Date(order.createdAt).setDate(
                      new Date(order.createdAt).getDate() + 7
                    ) &&
                      new Date(
                        new Date(order.createdAt).setDate(
                          new Date(order.createdAt).getDate() + 7
                        )
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center mt-2">
                  <div className="w-full h-2 bg-gray-200 rounded-full relative overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full absolute transition-all duration-700 ease-in-out"
                      style={{
                        width: `${
                          (([
                            "processing",
                            "design",
                            "shipped",
                            "delivered",
                          ].indexOf(order.status.toLowerCase()) +
                            1) /
                            ["processing", "design", "shipped", "delivered"]
                              .length) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {modalData && modalData.image && (
                  <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-lg">
                      <button
                        onClick={() => setModalData(null)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
                      >
                        ✖
                      </button>
                      <img
                        src={
                          modalData.image?.startsWith("http")
                            ? modalData.image
                            : `${CLOUDINARY_BASE_URL}/${modalData.image}`
                        }
                        alt="Proof"
                        className="w-full h-auto rounded-md"
                      />
                      <p className="mt-2 text-center font-medium text-gray-700">
                        {modalData.label}
                      </p>
                    </div>
                  </div>
                )}

                {/* Steps with icons */}
                <div className="flex justify-between items-center mt-4">
                  {[
                    { icon: "📋", label: "Order Processed" },
                    {
                      icon: "💻",
                      label: "Order Design",
                      proofKey: "designProofImage",
                    },
                    {
                      icon: "📦",
                      label: "Order Shipped",
                      proofKey: "shippingSlipImage",
                    },
                    { icon: "🏠", label: "Order Delivered" },
                  ].map((step, index) => {
                    const hasProof = order.products[0][step.proofKey];
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center cursor-pointer group"
                        onClick={() => {
                          if (hasProof) {
                            setModalData({
                              image: order.products[0][step.proofKey],
                              label: step.label,
                            });
                          }
                        }}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 transform 
            ${
              hasProof
                ? "bg-purple-500 text-white scale-110 shadow-lg group-hover:scale-125"
                : "bg-gray-200 text-gray-400"
            }`}
                        >
                          {step.icon}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 font-medium text-center">
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {order.products.map((item, index) => {
                const productId =
                  typeof item.product === "object"
                    ? item.product._id.toString()
                    : item.product.toString();
                return (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 border-b pb-4"
                  >
                    <div className="flex justify-center">
                      {products[productId]?.images?.[0] ? (
                        <img
                          src={
                            products[productId]?.images?.[0]?.startsWith("http")
                              ? products[productId].images[0]
                              : `${CLOUDINARY_BASE_URL}/${products[productId].images[0]}`
                          }
                          alt={item.title}
                          className="w-32 h-32 object-cover rounded-lg"
                          onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/150")
                          }
                        />
                      ) : (
                        <p className="text-sm text-gray-500">
                          No product image
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-gray-700">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Color: {item.color || "Not specified"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Size: {item.size || "Not specified"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Price: ₹{item.price}
                      </p>
                      {item.designDescription && (
                        <p className="text-sm text-gray-500">
                          Design Description: {item.designDescription}
                        </p>
                      )}
                      {item.deliveredImage && (
                        <p className="text-sm text-gray-500">
                          Delivered Image Status:{" "}
                          {item.deliveredImageStatus || "Pending"}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      {item.customDesign ? (
                        <img
                          src={`${CLOUDINARY_BASE_URL}/${item.customDesign}`}
                          alt="Custom Design"
                          className="w-32 h-32 object-cover rounded-lg mb-2"
                          onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/150")
                          }
                        />
                      ) : (
                        <p className="text-sm text-gray-500 mb-2">
                          No custom design
                        </p>
                      )}
                      {order.status.toLowerCase() === "delivered" &&
                        !item.deliveredImage && (
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              ref={(el) =>
                                (fileInputRefs.current[
                                  `${order._id}-${productId}`
                                ] = el)
                              }
                              className="text-sm"
                            />
                            <button
                              onClick={() =>
                                handleImageUpload(order._id, productId)
                              }
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                              disabled={uploading[`${order._id}-${productId}`]}
                            >
                              {uploading[`${order._id}-${productId}`]
                                ? "Uploading..."
                                : "Upload Delivered Image"}
                            </button>
                          </div>
                        )}
                      {order.status.toLowerCase() === "delivered" &&
                        item.deliveredImageStatus === "confirmed" &&
                        !item.rating && (
                          <div className="space-y-2">
                            <select
                              value={ratings[`${order._id}-${productId}`] || ""}
                              onChange={(e) =>
                                setRatings((prev) => ({
                                  ...prev,
                                  [`${order._id}-${productId}`]: Number(
                                    e.target.value
                                  ),
                                }))
                              }
                              className="border border-gray-300 px-2 py-1 rounded-md"
                            >
                              <option value="">Rate (1-5)</option>
                              {[1, 2, 3, 4, 5].map((num) => (
                                <option key={num} value={num}>
                                  {num} Star{num > 1 ? "s" : ""}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() =>
                                handleRatingSubmit(
                                  order._id,
                                  productId,
                                  ratings[`${order._id}-${productId}`]
                                )
                              }
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                            >
                              Submit Rating
                            </button>
                          </div>
                        )}
                      {item.rating && (
                        <p className="text-sm text-gray-500">
                          Your Rating: {item.rating} Star
                          {item.rating > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Total Amount: ₹{order.totalAmount}
                </p>
                <p className="text-sm text-gray-600">
                  Payment Method: {order.paymentMethod}
                </p>
                <p className="text-sm text-gray-600">
                  Payment Status:{" "}
                  {order.paymentStatus.charAt(0).toUpperCase() +
                    order.paymentStatus.slice(1)}
                </p>
                <div className="flex flex-row">
                  <div className="mt-2 w-full">
                    <p className="text-sm font-medium text-gray-700">
                      Shipping Address:
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.address.street}, {order.address.city},{" "}
                      {order.address.state}, {order.address.postalCode},{" "}
                      {order.address.country}
                    </p>
                  </div>

                  {order.status.toLowerCase() === "shipped" &&
                    order.products.map((item, idx) => (
                      <div key={idx} className="flex justify-end mt-2">
                        <button
                          className="bg-blue-800 text-white w-32 p-2 rounded-md hover:bg-blue-900"
                          onClick={() =>
                            setModalData({ orderId: order._id, product: item })
                          }
                        >
                          Deliver
                        </button>
                      </div>
                    ))}
                  {order.status.toLowerCase() === "processing" && (
                    <div className="flex justify-end mt-2">
                      <button
                        className="bg-red-600 w-32 text-white p-2 rounded-md hover:bg-red-700"
                        onClick={() => setCancelModal(order._id)} // instead of calling handleCancelOrder directly
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}

                  {cancelModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-50">
                      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                          Are you sure you want to cancel this order?
                        </h2>
                        <div className="flex justify-end space-x-4">
                          <button
                            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                            onClick={() => setCancelModal(null)}
                          >
                            No
                          </button>
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            onClick={async () => {
                              await handleCancelOrder(cancelModal);
                              setOrders(
                                (prev) =>
                                  prev.filter(
                                    (order) => order._id !== cancelModal
                                  ) // remove order from list
                              );
                              setCancelModal(null);
                            }}
                          >
                            Yes, Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {modalData && modalData.product && (
                    <Deliver
                      orderId={modalData.orderId}
                      product={modalData.product}
                      onClose={() => setModalData(null)}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
      <ToastContainer
        position="bottom-left"
        autoClose={2000}
        hideProgressBar={true}
      />
    </div>
  );
};

export default Myorder;

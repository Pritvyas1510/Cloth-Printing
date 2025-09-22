import React, { useState, useEffect } from "react";
import AxiosInstance from "../../../Axios/AxiosInstance";
import { useAuth } from "../../../AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderDesign from "./OrderDesign";
import ShippedDetails from "./ShippedDetails";

const AllOrder = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedShippedId, setSelectedShippedId] = useState(null);

  const navigate = useNavigate();

  const CLOUDINARY_BASE_URL =
    "https://res.cloudinary.com/dopqalob9/image/upload";

  // Status flow in order
  const statusSteps = ["processing", "design", "shipped", "delivered"];

  const fetchOrdersAndProducts = async () => {
    try {
      const response = await AxiosInstance.get("/api/orders", {
        withCredentials: true,
        headers: {
          "x-session-id":
            localStorage.getItem("sessionId") ||
            `guest_${Math.random().toString(36).substr(2, 9)}`,
        },
      });
      const ordersData = Array.isArray(response.data) ? response.data : [];
      const validOrders = ordersData.filter(
        (order) =>
          order._id &&
          typeof order._id === "string" &&
          order.status &&
          !["completed", "cancel"].includes(order.status.toLowerCase())
      );
      setOrders(validOrders);
      const productIds = [
        ...new Set(
          validOrders.flatMap((order) =>
            order.products.map((item) =>
              typeof item.product === "object" && item.product?._id
                ? item.product._id.toString()
                : item.product.toString()
            )
          )
        ),
      ];

      const productPromises = productIds.map((id) =>
        AxiosInstance.get(`/api/products/${id}`).catch(() => ({ data: null }))
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
      setError(err.response?.data?.message || "Failed to fetch orders");
      setOrders([]);
      setLoading(false);
      toast.error(err.response?.data?.message || "Failed to fetch orders", {
        position: "top-left",
      });
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      toast.error("Please log in to view orders", { position: "top-left" });
      setError("Please log in to view orders");
      setLoading(false);
      navigate("/login");
      return;
    }

    fetchOrdersAndProducts();
  }, [isAuthenticated, authLoading, navigate]);

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800",
    design: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const getExpectedArrival = (createdAt) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const openModal = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const closeModal = () => {
    setSelectedOrderId(null);
    setSelectedShippedId(null);
    fetchOrdersAndProducts();
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-base">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-base">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6 text-center tracking-tight">
        All Orders
      </h1>
      <div className="space-y-6">
        {orders.map((order) => {
          const currentStepIndex = statusSteps.indexOf(
            order.status.toLowerCase()
          );

          return (
            <div
              key={order._id}
              className="bg-white shadow-lg rounded-xl p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 tracking-wide">
                    Order #{order._id.slice(-6)}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Placed on:{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold self-start sm:self-auto ${
                    statusStyles[order.status.toLowerCase()] ||
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative mb-6">
                <div className="text-xs text-gray-500 font-medium mb-1">
                  Expected Arrival: {getExpectedArrival(order.createdAt)}
                </div>
                <div className="flex items-center">
                  <div className="w-full h-2 bg-gray-200 rounded-full relative overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full absolute transition-all duration-700 ease-in-out"
                      style={{
                        width: `${
                          ((currentStepIndex + 1) / statusSteps.length) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Steps */}
                <div className="flex justify-between items-center mt-2 text-[10px] sm:text-xs">
                  {[
                    { icon: "📋", label: "Processed" },
                    { icon: "💻", label: "Designing" },
                    { icon: "📦", label: "Shipped" },
                    { icon: "🏠", label: "Arrived" },
                  ].map((step, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 cursor-pointer rounded-full flex items-center justify-center text-sm sm:text-base ${
                          index <= currentStepIndex
                            ? "bg-purple-500 text-white scale-110"
                            : "bg-gray-200 text-gray-400"
                        } transition-all duration-500`}
                      >
                        {step.icon}
                      </div>
                      <p className="mt-1 text-gray-600">{step.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Products + User Details */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Products */}
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-800 mb-2">
                    Products
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {order.products.map((item, index) => {
                      const productId =
                        typeof item.product === "object" && item.product?._id
                          ? item.product._id.toString()
                          : item.product.toString();
                      return (
                        <div
                          key={index}
                          className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              {products[productId]?.images?.[0] ? (
                                <img
                                  src={
                                    products[productId].images[0].startsWith(
                                      "http"
                                    )
                                      ? products[productId].images[0]
                                      : `${CLOUDINARY_BASE_URL}/${products[productId].images[0]}`
                                  }
                                  alt={item.title}
                                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                                  onError={(e) =>
                                    (e.target.src =
                                      "https://via.placeholder.com/150")
                                  }
                                />
                              ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-700">
                                {item.title}
                              </h3>
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Color:</span>{" "}
                                {item.color || "Not specified"}
                              </p>
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Size:</span>{" "}
                                {item.size || "Not specified"}
                              </p>
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Qty:</span>{" "}
                                {item.quantity}
                              </p>
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Price:</span> ₹
                                {item.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              {item.customDesign ? (
                                <img
                                  src={
                                    item.customDesign.startsWith("http")
                                      ? item.customDesign
                                      : `${CLOUDINARY_BASE_URL}/${item.customDesign}`
                                  }
                                  alt="Custom Design"
                                  className="w-20 h-20 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/150";
                                  }}
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                                  No Custom Design
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* User Details */}
                <div className="lg:w-1/3 bg-gray-50 p-3 rounded-lg border">
                  <h3 className="text-base font-semibold text-gray-800 mb-2">
                    User Details
                  </h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Name:</span>{" "}
                    {order.user?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span>{" "}
                    {order.user?.email || "N/A"}
                  </p>
                  {order.user?.phone && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span>{" "}
                      {order.user.phone}
                    </p>
                  )}
                  {order.address && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Address:</span>{" "}
                      {order.address.street}, {order.address.city},{" "}
                      {order.address.state}, {order.address.postalCode},{" "}
                      {order.address.country}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t pt-3 mt-3 gap-3">
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Total Amount:</span>{" "}
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(order.totalAmount)}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Payment Method:</span>{" "}
                    {order.paymentMethod}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Payment Status:</span>{" "}
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </p>
                </div>

                <div className="flex gap-3">
                  {/* Design Button */}
                  <button
                    className={`px-4 py-2 rounded-xl shadow-md text-sm transition-transform transform 
                     ${
                       order.status.toLowerCase() === "design" ||
                       order.status.toLowerCase() === "shipped" ||
                       order.status.toLowerCase() === "delivered"
                         ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                         : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white hover:scale-105"
                     }`}
                    disabled={
                      order.status.toLowerCase() === "design" ||
                      order.status.toLowerCase() === "shipped" ||
                      order.status.toLowerCase() === "delivered"
                    }
                    onClick={() => openModal(order._id)}
                  >
                    Design
                  </button>

                  {/* Shipped Button */}
                  <button
                    className={`px-4 py-2 rounded-xl shadow-md text-sm transition-transform transform 
                      ${
                        order.status.toLowerCase() === "shipped" ||
                        order.status.toLowerCase() === "delivered"
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white hover:scale-105"
                      }`}
                    disabled={
                      order.status.toLowerCase() === "shipped" ||
                      order.status.toLowerCase() === "delivered"
                    }
                    onClick={() => setSelectedShippedId(order._id)}
                  >
                    Shipped
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
            <OrderDesign orderId={selectedOrderId} onClose={closeModal} />
          </div>
        </div>
      )}

      {/* Shipped Modal */}
      {selectedShippedId && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
            <ShippedDetails orderId={selectedShippedId} onClose={closeModal} />
          </div>
        </div>
      )}
      <ToastContainer
        position="bottom-left"
        autoClose={2000}
        hideProgressBar={true}
      />
    </div>
  );
};

export default AllOrder;

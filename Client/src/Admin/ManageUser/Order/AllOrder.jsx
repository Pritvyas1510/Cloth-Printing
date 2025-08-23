import React, { useState, useEffect } from "react";
import AxiosInstance from "../../../Axios/AxiosInstance";
import { useAuth } from "../../../AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderDesign from "./OrderDesign";

const AllOrder = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URI || "http://localhost:5000";
  const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/das7xphnt/image/upload";

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
        (order) => order._id && typeof order._id === "string"
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
    <div className="container mx-auto p-4 max-w-5xl bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center tracking-tight">
        All Orders
      </h1>
      <div className="space-y-6">
        {orders.map((order) => {
          const currentStepIndex = statusSteps.indexOf(order.status.toLowerCase());

          return (
            <div
              key={order._id}
              className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 tracking-wide">
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
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    statusStyles[order.status.toLowerCase()] ||
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 font-medium">
                    Expected Arrival: {getExpectedArrival(order.createdAt)}
                  </div>
                </div>
                <div className="flex items-center mt-2">
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
                <div className="flex justify-between items-center mt-2">
                  {[
                    { icon: "📋", label: "Order Processed" },
                    { icon: "💻", label: "Order Designing" },
                    { icon: "📦", label: "Order Shipped" },
                    { icon: "🏠", label: "Order Arrived" },
                  ].map((step, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 cursor-pointer rounded-full flex items-center justify-center text-base ${
                          index <= currentStepIndex
                            ? "bg-purple-500 text-white scale-110"
                            : "bg-gray-200 text-gray-400"
                        } transition-all duration-500`}
                      >
                        {step.icon}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 font-medium text-center">
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product details */}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-800 mb-2">Products</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {order.products.map((item, index) => {
                    const productId =
                      typeof item.product === "object" && item.product?._id
                        ? item.product._id.toString()
                        : item.product.toString();
                    return (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex flex-row items-start space-x-3">
                          <div className="flex-shrink-0">
                            {products[productId]?.images?.[0] ? (
                              <img
                                src={`${BASE_URL}/${products[productId].images[0]}`}
                                alt={item.title}
                                className="w-20 h-20 object-cover rounded-lg"
                                onError={(e) =>
                                  (e.target.src = "https://via.placeholder.com/150")
                                }
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">
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
                              <span className="font-medium">Quantity:</span>{" "}
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
                                  console.error(
                                    `Failed to load custom design image: ${item.customDesign}`
                                  );
                                  e.target.src = "https://via.placeholder.com/150";
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

              {/* Footer */}
              <div className="flex justify-between items-center border-t pt-3">
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Total Amount:</span>{" "}
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(order.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Payment Method:</span>{" "}
                    {order.paymentMethod}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Payment Status:</span>{" "}
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-2 rounded-xl shadow-md transition-transform transform hover:scale-105"
                    onClick={() => openModal(order._id)}
                  >
                    Design
                  </button>
                  <button className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-4 py-2 rounded-xl shadow-md transition-transform transform hover:scale-105">
                    Shipped
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for OrderDesign */}
      {selectedOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
            <OrderDesign orderId={selectedOrderId} onClose={closeModal} />
          </div>
        </div>
      )}
      <ToastContainer position="top-left" autoClose={3000} />
    </div>
  );
};

export default AllOrder;

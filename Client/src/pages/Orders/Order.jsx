import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import axios from "../../Axios/AxiosInstance";
import { useAuth } from "../../AuthContext/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import mongoose from "mongoose";

const Order = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [addressType, setAddressType] = useState("Home");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [products, setProducts] = useState({});
  const CLOUDINARY_BASE_URL =
    "https://res.cloudinary.com/dopqalob9/image/upload";
  const RAZORPAY_KEY_ID =
    import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_VQhEfe2NCXbbwI";
  const BASE_URL = import.meta.env.VITE_BACKEND_URI || "http://localhost:5000";

  const getImageUrl = (image) => {
    if (!image) return "https://via.placeholder.com/150";

    // Full Cloudinary or external link
    if (image.startsWith("http")) return image;

    // Cloudinary public_id (folder/filename)
    if (image.includes("/")) {
      return `https://res.cloudinary.com/dopqalob9/image/upload/${image}`;
    }

    // Local backend upload
    return `${BASE_URL}/${image}`;
  };

  useEffect(() => {
    loadRazorpayScript();

    const fetchData = async () => {
      try {
        const cartData = location.state?.cart;

        let fetchedOrder;
        if (!cartData && user?._id) {
          const response = await axios.get(`/api/orders/${id}`, {
            headers: { "x-session-id": localStorage.getItem("sessionId") },
            withCredentials: true,
          });
          fetchedOrder = response.data;
          setOrderData(fetchedOrder);
        } else if (cartData) {
          setOrderData(cartData);
        } else {
          toast.error("No order or cart data available.", {
            position: "top-left",
          });
          setOrderData({ items: [] });
          setLoading(false);
          return;
        }

        if (fetchedOrder?.paymentStatus === "done") {
          navigate(`/order/${id}`, {
            state: { order: fetchedOrder },
          });
          return;
        }

        if (user?._id) {
          const res = await axios.get(`/api/profile/${user._id}`, {
            withCredentials: true,
          });
          setProfile(res.data);
          if (res.data?.address) {
            setAddress({
              street: res.data.address || "",
              city: "",
              state: "",
              postalCode: res.data.pincode || "",
              country: "",
            });
          }
        }

        if (fetchedOrder?.items?.length > 0 || cartData?.items?.length > 0) {
          const items = fetchedOrder?.items || cartData.items;
          const productPromises = items.map((item) => {
            const productId =
              item.productId?._id || item.productId || item.product;
            if (!productId || typeof productId !== "string") {
              console.warn("Invalid productId:", productId);
              return Promise.resolve({ data: null });
            }
            return axios
              .get(`/api/products/${productId}`)
              .catch(() => ({ data: null }));
          });
          const productResponses = await Promise.all(productPromises);
          const productMap = {};
          productResponses.forEach((res, index) => {
            const productId =
              items[index].productId?._id ||
              items[index].productId ||
              items[index].product;
            productMap[productId] = res.data || {
              _id: productId,
              title: "Unknown Product",
              images: [],
            };
          });
          setProducts(productMap);
        }
      } catch (error) {
        console.error("Fetch error:", error.response?.data || error.message);
        toast.error(
          `Failed to load order: ${
            error.response?.data?.message || error.message
          }`,
          { position: "top-left" }
        );
        setOrderData({ items: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.state, user, id, navigate]);

  const loadRazorpayScript = (retries = 3, delay = 1000) => {
    return new Promise((resolve) => {
      const attemptLoad = (attempt) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => {
          if (attempt < retries) {
            setTimeout(() => attemptLoad(attempt + 1), delay);
          } else {
            resolve(false);
          }
        };
        document.body.appendChild(script);
      };
      attemptLoad(1);
    });
  };

  useEffect(() => {
    if (profile && addressType === "Home") {
      setAddress({
        street: profile.address || "",
        city: "",
        state: "",
        postalCode: profile.pincode || "",
        country: "",
      });
    } else {
      setAddress({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      });
    }
  }, [addressType, profile]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const clearCart = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      console.log("Clearing cart for sessionId:", sessionId); // ADDED: Debug cart clearing
      if (!sessionId) {
        throw new Error("Session ID missing.");
      }
      const cartCheck = await axios.get("/api/cart/get", {
        headers: { "x-session-id": sessionId },
        withCredentials: true,
      });
      if (!cartCheck.data?.items?.length) {
        console.warn("Cart is empty or not found");
        return;
      }
      await axios.post(
        "/api/cart/clear",
        {},
        {
          headers: { "x-session-id": sessionId },
          withCredentials: true,
        }
      );
      setOrderData({ items: [] });
      const response = await axios.get("/api/cart/get", {
        headers: { "x-session-id": sessionId },
        withCredentials: true,
      });
      if (response.data?.items?.length > 0) {
        throw new Error("Cart not cleared on backend.");
      }
      console.log("Cart cleared successfully"); // ADDED: Confirm success
    } catch (error) {
      console.error("Clear cart error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      toast.error(
        `Failed to clear cart: ${
          error.response?.data?.message || error.message
        }`,
        {
          position: "top-left",
        }
      );
      throw error;
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    console.log("Submitting order with paymentMethod:", paymentMethod);

    if (!orderData || !id) {
      toast.error("Order data or ID is missing.", { position: "top-left" });
      return;
    }

    if (!orderData.items?.length) {
      toast.error("No items in the order.", { position: "top-left" });
      return;
    }

    if (
      !address.street ||
      !address.city ||
      !address.state ||
      !address.postalCode ||
      !address.country
    ) {
      toast.error("Please fill all address fields.", { position: "top-left" });
      return;
    }

    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      toast.error("Session ID is missing. Please log in again.", {
        position: "top-left",
      });
      navigate("/login");
      return;
    }

    const invalidProduct = orderData.items.find((item) => {
      const productId = item.productId?._id || item.productId || item.product;
      return (
        !productId ||
        !mongoose.Types.ObjectId.isValid(productId) ||
        !Number.isFinite(Number(item.price)) ||
        !Number.isFinite(Number(item.quantity))
      );
    });
    if (invalidProduct) {
      console.error("Invalid product:", invalidProduct);
      toast.error(
        "Invalid product data. Ensure all items have a valid product ID, price, and quantity.",
        { position: "top-left" }
      );
      return;
    }

    try {
      const cartCheck = await axios.get("/api/cart/get", {
        headers: { "x-session-id": sessionId },
        withCredentials: true,
      });
      if (!cartCheck.data?.items?.length) {
        toast.error("Cart is empty. Add items to proceed.", {
          position: "top-left",
        });
        navigate("/cart");
        return;
      }
    } catch (error) {
      console.error("Cart check error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Failed to verify cart. Please try again.", {
        position: "top-left",
      });
      return;
    }

    const orderDetails = {
      cartId: id,
      products: orderData.items.map((item) => ({
        productId: item.productId?._id || item.productId || item.product,
        title:
          products[item.productId?._id || item.productId || item.product]
            ?.title ||
          item.title ||
          "Untitled",
        color: item.color || "Not specified",
        size: item.size || "Not specified",
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        designDescription: item.designDescription,
        customDesign: item.customDesign,
      })),
      totalAmount: orderData.items.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      ),
      address,
      paymentMethod,
    };

    if (
      !orderDetails.products.every((item) =>
        mongoose.Types.ObjectId.isValid(item.productId)
      )
    ) {
      console.error(
        "Invalid productId in orderDetails:",
        orderDetails.products
      );
      toast.error("Invalid product data.", { position: "top-left" });
      return;
    }
    if (
      !Number.isFinite(orderDetails.totalAmount) ||
      orderDetails.totalAmount <= 0
    ) {
      console.error("Invalid totalAmount:", orderDetails.totalAmount);
      toast.error("Invalid order amount.", { position: "top-left" });
      return;
    }
    const addr = orderDetails.address;
    if (
      !addr.street ||
      !addr.city ||
      !addr.state ||
      !addr.postalCode ||
      !addr.country
    ) {
      console.error("Incomplete address:", orderDetails.address);
      toast.error("Incomplete address.", { position: "top-left" });
      return;
    }

    setPaymentLoading(true);

    try {
      if (paymentMethod === "Razorpay") {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error("Failed to load payment gateway. Please try again.", {
            position: "top-left",
          });
          setPaymentLoading(false);
          return;
        }

        console.log("Razorpay Key ID:", RAZORPAY_KEY_ID);
        const response = await axios.post(
          "/api/payment/create-payment",
          { amount: orderDetails.totalAmount },
          { headers: { "x-session-id": sessionId }, withCredentials: true }
        );

        const { orderId } = response.data;

        const options = {
          key: RAZORPAY_KEY_ID,
          amount: orderDetails.totalAmount * 100,
          currency: "INR",
          name: "Stitch Design",
          description: "Order Payment",
          order_id: orderId,
          handler: async (response) => {
            try {
              console.log("Sending to /api/orders/verify:", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails,
              });
              const verifyResponse = await axios.post(
                "/api/orders/verify",
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderDetails,
                },
                {
                  headers: { "x-session-id": sessionId },
                  withCredentials: true,
                }
              );
              await clearCart();
              toast.success("Order placed successfully!", {
                position: "top-left",
              });
              navigate(`/myorder`, {
                state: { order: verifyResponse.data.order },
              });
            } catch (err) {
              console.error(
                "Payment verification error:",
                err.response?.data || err
              );
              toast.error(
                `Payment verification failed: ${
                  err.response?.data?.message || err.message
                }`,
                { position: "top-left" }
              );
            } finally {
              setPaymentLoading(false);
            }
          },
          prefill: {
            name: profile?.name || "",
            email: profile?.email || "",
            contact: profile?.mobile || "",
          },
          theme: { color: "#2563eb" },
        };

        console.log("Opening Razorpay UI");
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", () => {
          toast.error("Payment failed. Try again.", { position: "top-left" });
          setPaymentLoading(false);
        });
        rzp.open();
      } else {
        console.log("Sending orderDetails to /api/orders/cod:", orderDetails);
        const codResponse = await axios
          .post(
            "/api/orders/cod", // ✅ COD route
            { orderDetails }, // ✅ Wrap orderDetails
            { headers: { "x-session-id": sessionId }, withCredentials: true }
          )
          .catch((err) => {
            throw new Error(
              `COD order creation failed: ${
                err.response?.data?.message || err.message
              }`
            );
          });

        await clearCart();
        toast.success("COD Order placed successfully!", {
          position: "top-left",
        });
        navigate(`/myorder`, {
          state: { order: codResponse.data.order },
        });
      }
    } catch (error) {
      console.error("Order submission error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      toast.error(
        `Order error: ${paymentMethod} - ${
          error.response?.data?.message || error.message
        }`,
        { position: "top-left" }
      );
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!orderData || !orderData.items?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">No items in the order.</p>
        <Link to="/cart" className="text-blue-600 hover:underline">
          Back to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 bg-gray-100 min-h-screen">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
        Place Your Order
      </h2>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:flex-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            Order Summary
          </h3>
          <div className="space-y-4">
            {orderData.items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-gray-200 py-3 sm:py-4"
              >
                {/* Product Image */}
                <div className="w-full sm:w-24 h-24 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={
                      products[
                        item.productId?._id || item.productId || item.product
                      ]?.images?.[0]
                        ? getImageUrl(
                            products[
                              item.productId?._id ||
                                item.productId ||
                                item.product
                            ]?.images?.[0]
                          )
                        : "https://via.placeholder.com/150"
                    }
                    alt="Product"
                    className="object-contain h-full w-full"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 w-full sm:text-justify lg:text-center md:text-center">
                  <Link
                    to={`/productdetails/${
                      item.productId?._id || item.productId || item.product
                    }`}
                    className="text-gray-800 font-medium text-base sm:text-lg hover:text-blue-600 block truncate"
                  >
                    {products[
                      item.productId?._id || item.productId || item.product
                    ]?.title ||
                      item.title ||
                      "Untitled"}
                  </Link>
                  <p className="text-sm text-gray-600">
                    Color: {item.color || "Not specified"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Size: {item.size || "Not specified"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity || 1}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    ₹{(item.price * (item.quantity || 1)).toFixed(2)}
                  </p>
                  {item.designDescription && (
                    <p className="text-sm text-gray-500 italic">
                      Note: {item.designDescription}
                    </p>
                  )}
                </div>

                {/* Custom Design Image */}
                {item.customDesign && (
                  <div className="w-full sm:w-24 h-24 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={`${CLOUDINARY_BASE_URL}/${item.customDesign}`}
                      alt="Custom Design"
                      className="object-contain h-full w-full"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 text-right">
            <p className="text-lg sm:text-xl font-semibold text-gray-800">
              Total: ₹
              {orderData.items
                .reduce(
                  (sum, item) =>
                    sum + Number(item.price || 0) * Number(item.quantity || 1),
                  0
                )
                .toFixed(2)}
            </p>
          </div>
        </div>

        {/* Shipping + Payment Form */}
        {orderData?.paymentStatus !== "done" && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:flex-1">
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Shipping Address */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                  Shipping Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["street", "city", "state", "postalCode", "country"].map(
                    (field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        <input
                          type="text"
                          name={field}
                          placeholder={
                            field.charAt(0).toUpperCase() + field.slice(1)
                          }
                          value={address[field]}
                          onChange={handleAddressChange}
                          className="w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                  Payment Method
                </h3>
                <div className="space-y-2">
                  {["Razorpay", "Cash on Delivery"].map((method) => (
                    <label
                      key={method}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      {method}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
                disabled={paymentLoading}
              >
                {paymentLoading ? "Processing..." : "Pay Now"}
              </button>
            </form>
          </div>
        )}
      </div>

      <ToastContainer
        position="top-left"
        autoClose={3000}
        hideProgressBar={true}
      />
    </div>
  );
};

export default Order;

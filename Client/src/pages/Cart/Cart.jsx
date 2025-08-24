import React, { useEffect, useState, useRef } from "react";
import axios from "../../Axios/AxiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";

// ---------------------------------------------
//  Add missing helper to generate sessionId 👇
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 10);
};
// ---------------------------------------------

// Define colorStyles object
const colorStyles = {
  Red: "bg-red-500",
  Blue: "bg-blue-500",
  Green: "bg-green-500",
  Black: "bg-black",
  White: "bg-white border border-[#cedbe8]",
  Yellow: "bg-yellow-500",
  Orange: "bg-orange-500",
  Purple: "bg-purple-500",
  Pink: "bg-pink-500",
  Brown: "bg-amber-700",
  Gray: "bg-gray-500",
  Cyan: "bg-cyan-500",
  Magenta: "bg-fuchsia-500",
  Navy: "bg-indigo-900",
  Teal: "bg-teal-500",
  Maroon: "bg-red-900",
  Olive: "bg-green-600",
  Lime: "bg-lime-500",
  Silver: "bg-gray-300",
  Gold: "bg-yellow-600",
};

// Initialize or retrieve sessionId
const getSessionId = () => {
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId =
      req.headers["x-session-id"] ||
      `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
};

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState({});
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    quantity: "",
    color: "",
    size: "",
    designDescription: "",
    customDesign: null,
  });

  const navigate = useNavigate();
  const updateDialogRef = useRef(null);
  const deleteDialogRef = useRef(null);

  const BASE_URL = import.meta.env.BACKEND_URI || "http://localhost:5000";
  const CLOUDINARY_BASE_URL =
    "https://res.cloudinary.com/dopqalob9/image/upload";

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const sessionId = getSessionId(); // Ensure sessionId is valid
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/cart/get", {
          headers: {
            "x-session-id": sessionId,
            Authorization: `Bearer ${token}`, // or however you store your token
          },
        });

        if (
          !response.data ||
          !response.data.items ||
          !Array.isArray(response.data.items)
        ) {
          setCart({ items: [] });
        } else {
          setCart(response.data);
          const productPromises = response.data.items.map((item) =>
            axios
              .get(`/api/products/${item.productId._id || item.productId}`)
              .catch(() => ({ data: null }))
          );
          const productResponses = await Promise.all(productPromises);
          const productMap = {};
          productResponses.forEach((res, index) => {
            if (res.data) {
              productMap[
                response.data.items[index].productId._id ||
                  response.data.items[index].productId
              ] = res.data;
            }
          });
          setProducts(productMap);
        }
      } catch (error) {
        console.error(
          "Fetch cart error:",
          error.response?.data || error.message
        );
        toast.error(
          `Failed to load cart: ${
            error.response?.data?.message || error.message
          }`,
          { position: "top-left" }
        );
        setCart({ items: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // Helper to decide if image is Cloudinary URL or local
  const getImageUrl = (image) => {
  if (!image) return "https://via.placeholder.com/150";

  // If full Cloudinary or any external URL
  if (image.startsWith("http")) return image;

  // If it's Cloudinary public_id
  if (image.includes("/")) {
    return `https://res.cloudinary.com/dopqalob9/image/upload/${image}`;
  }

  // Otherwise assume local backend
  return `${BASE_URL}/${image}`;
};


  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!currentItem) {
      toast.error("No item selected for update.", { position: "top-left" });
      return;
    }
    try {
      const sessionId = getSessionId(); // Ensure sessionId is valid
      const formData = new FormData();
      formData.append(
        "productId",
        currentItem.productId._id || currentItem.productId
      );
      formData.append("color", currentItem.color || "");
      formData.append("size", currentItem.size || "");
      if (updateForm.quantity) formData.append("quantity", updateForm.quantity);
      if (updateForm.color) formData.append("newColor", updateForm.color);
      if (updateForm.size) formData.append("newSize", updateForm.size);
      if (updateForm.designDescription)
        formData.append("designDescription", updateForm.designDescription);
      if (updateForm.customDesign)
        formData.append("customDesign", updateForm.customDesign);

      const response = await axios.put("/api/cart/update", formData, {
        headers: {
          "x-session-id": sessionId,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      setCart(response.data.cart);
      toast.success("Item updated successfully!", { position: "top-left" });
      setIsUpdateModalOpen(false);
      setUpdateForm({
        quantity: "",
        color: "",
        size: "",
        designDescription: "",
        customDesign: null,
      });
      setCurrentItem(null);
      if (updateDialogRef.current) {
        updateDialogRef.current.close();
      }
    } catch (error) {
      console.error(
        "Update item error:",
        error.response?.data || error.message
      );
      toast.error(
        `Failed to update item: ${
          error.response?.data?.message || error.message
        }`,
        {
          position: "top-left",
        }
      );
    }
  };

  const handleDeleteItem = async () => {
    if (!currentItem) {
      toast.error("No item selected for deletion.", { position: "top-left" });
      return;
    }
    try {
      const sessionId = getSessionId(); // Ensure sessionId is valid
      const response = await axios.delete("/api/cart/delete", {
        headers: { "x-session-id": sessionId },
        data: {
          productId: currentItem.productId._id || currentItem.productId,
          color: currentItem.color || "",
          size: currentItem.size || "",
        },
        withCredentials: true,
      });

      setCart(response.data.cart);
      toast.success("Item removed successfully!", { position: "top-left" });
      setIsDeleteModalOpen(false);
      setCurrentItem(null);
      if (deleteDialogRef.current) {
        deleteDialogRef.current.close();
      }
    } catch (error) {
      console.error(
        "Delete item error:",
        error.response?.data || error.message
      );
      toast.error(
        `Failed to delete item: ${
          error.response?.data?.message || error.message
        }`,
        {
          position: "top-left",
        }
      );
    }
  };

  const openUpdateModal = (item) => {
    if (!item || !item.productId) {
      toast.error("Invalid item data. Cannot update.", {
        position: "top-left",
      });
      return;
    }
    setCurrentItem(item);
    setUpdateForm({
      quantity: item.quantity?.toString() || "",
      color: item.color || "",
      size: item.size || "",
      designDescription: item.designDescription || "",
      customDesign: null,
    });
    setIsUpdateModalOpen(true);
    if (updateDialogRef.current) {
      updateDialogRef.current.showModal();
    }
  };

  const openDeleteModal = (item) => {
    if (!item || !item.productId) {
      toast.error("Invalid item data. Cannot delete.", {
        position: "top-left",
      });
      return;
    }
    setCurrentItem(item);
    setIsDeleteModalOpen(true);
    if (deleteDialogRef.current) {
      deleteDialogRef.current.showModal();
    }
  };

  const closeModal = () => {
    setIsUpdateModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentItem(null);
    setUpdateForm({
      quantity: "",
      color: "",
      size: "",
      designDescription: "",
      customDesign: null,
    });
    if (updateDialogRef.current) {
      updateDialogRef.current.close();
    }
    if (deleteDialogRef.current) {
      deleteDialogRef.current.close();
    }
  };

  const handleOrderNow = (item) => {
    if (!cart || !cart._id) {
      toast.error("Cart data is unavailable.", { position: "top-left" });
      return;
    }
    navigate(`/order/${cart._id}`, { state: { cart } });
  };

  const getProductOptions = (productId) => {
    const product = products[productId._id || productId];
    return {
      sizes: product?.size || [],
      colors: product?.color || [],
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin h-14 w-14 border-t-4 border-b-4 border-indigo-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <h2 className="text-5xl font-extrabold text-indigo-900 mb-10 text-center tracking-wide">
        Your Shopping Cart
      </h2>
      {!cart || !cart.items || cart.items.length === 0 ? (
        <div className="text-center bg-white rounded-2xl shadow-2xl p-8 max-w-lg mx-auto animate-fade-in">
          <p className="text-2xl text-gray-800 font-semibold mb-4">
            Your cart is empty.
          </p>
          <Link
            to="/design"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <p className="text-red-600 font-bold text-center">
            {cart.items.length} items in your cart
          </p>
          {cart.items.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center hover:shadow-2xl transition-all duration-300 animate-fade-in border border-gray-100"
            >
              <div className="h-48 bg-gray-100 flex items-center justify-center rounded-xl border border-gray-200 overflow-hidden">
                {products[item.productId._id || item.productId]?.images?.[0] ? (
                  <img
                    src={getImageUrl(
                      products[item.productId._id || item.productId]
                        ?.images?.[0]
                    )}
                    alt="Product Image"
                    className="object-contain h-full max-w-full transition-transform duration-300 hover:scale-110"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/150")
                    }
                  />
                ) : (
                  <div className="text-gray-500 font-medium text-sm">
                    No product image
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Link
                  to={`/productdetails/${item.productId._id || item.productId}`}
                  className="text-2xl font-bold text-indigo-900 hover:text-indigo-600 transition-colors duration-200"
                >
                  {item.title || "Untitled"}
                </Link>
                <p className="text-gray-700 text-base">
                  <strong className="font-semibold">Color:</strong>{" "}
                  {item.color || "Not specified"}
                </p>
                <p className="text-gray-700 text-base">
                  <strong className="font-semibold">Size:</strong>{" "}
                  {item.size || "Not specified"}
                </p>
                <p className="text-gray-700 text-base">
                  <strong className="font-semibold">Quantity:</strong>{" "}
                  {item.quantity || 1}
                </p>
                <p className="text-gray-700 text-base">
                  <strong className="font-semibold">Price:</strong> ₹
                  {item.price && item.quantity
                    ? (item.price * item.quantity).toFixed(2)
                    : "0.00"}
                </p>
                {item.designDescription && (
                  <p className="text-sm text-gray-600 italic">
                    <strong className="font-semibold">Note:</strong>{" "}
                    {item.designDescription}
                  </p>
                )}
              </div>
              <div className="h-48 bg-gray-100 flex items-center justify-center rounded-xl border border-gray-200 overflow-hidden">
                {item.customDesign ? (
                  <img
                    src={getImageUrl(item.customDesign)}
                    alt="Custom Design"
                    className="object-contain h-full max-w-full transition-transform duration-300 hover:scale-110"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/150")
                    }
                  />
                ) : (
                  <div className="text-gray-500 font-medium text-sm">
                    No design uploaded
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center justify-center space-y-3">
                <button
                  onClick={() => handleOrderNow(item)}
                  className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 w-full"
                >
                  Order Now
                </button>
                <button
                  onClick={() => openUpdateModal(item)}
                  className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 w-full"
                >
                  Update
                </button>
                <button
                  onClick={() => openDeleteModal(item)}
                  className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 w-full"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isUpdateModalOpen && (
        <dialog
          ref={updateDialogRef}
          className="modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-box bg-white rounded-xl p-8 shadow-2xl border border-gray-200">
            <h3 className="font-bold text-2xl text-indigo-900 mb-6 text-center">
              Update Your Item
            </h3>
            <form onSubmit={handleUpdateItem} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-gray-700 font-semibold mb-2">
                  Product
                </label>
                <p className="text-lg text-gray-900 font-medium">
                  {currentItem?.title || "Untitled"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-gray-700 font-semibold mb-2">
                  Size
                </label>
                <div className="flex flex-wrap gap-3">
                  {getProductOptions(currentItem?.productId).sizes.map(
                    (size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setUpdateForm({ ...updateForm, size })}
                        className={`px-5 py-2 rounded-full font-medium text-sm ${
                          updateForm.size === size
                            ? "bg-blue-500 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                        } transition`}
                      >
                        {size}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-gray-700 font-semibold mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {getProductOptions(currentItem?.productId).colors.map(
                    (color) => (
                      <div
                        key={color}
                        onClick={() => setUpdateForm({ ...updateForm, color })}
                        className={`relative w-8 h-8 rounded-full cursor-pointer border-2 transition-all duration-200 ${
                          colorStyles[color] || "bg-gray-300"
                        } ${
                          updateForm.color === color
                            ? "border-blue-500 ring-2 ring-offset-2 ring-blue-500 scale-110"
                            : "border-gray-300 hover:scale-105"
                        }`}
                        title={color}
                      >
                        {updateForm.color === color && (
                          <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-gray-700 font-semibold mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={updateForm.quantity}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, quantity: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Enter quantity"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-gray-700 font-semibold mb-2">
                  Price
                </label>
                <p className="text-lg text-gray-900 font-medium">
                  ₹
                  {currentItem?.price && currentItem.quantity
                    ? (currentItem.price * currentItem.quantity).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-gray-700 font-semibold mb-2">
                  Design Description
                </label>
                <textarea
                  value={updateForm.designDescription}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      designDescription: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Enter design description"
                  rows="4"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-gray-700 font-semibold mb-2">
                  Current Custom Design
                </label>
                {currentItem?.customDesign ? (
                  <img
                    src={`${CLOUDINARY_BASE_URL}/${currentItem.customDesign}`}
                    alt="Current Custom Design"
                    className="w-32 h-32 object-contain rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                ) : (
                  <p className="text-gray-500">No current design</p>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-gray-700 font-semibold mb-2">
                  Upload New Custom Design Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      customDesign: e.target.files[0],
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-900 bg-white"
                />
              </div>
              <div className="modal-action flex justify-end gap-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Confirm Update
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {isDeleteModalOpen && (
        <dialog
          ref={deleteDialogRef}
          className="modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-box bg-white rounded-xl p-6 shadow-2xl border border-gray-200">
            <h3 className="font-bold text-xl text-red-900 mb-4 text-center">
              Confirm Delete
            </h3>
            <p className="py-2 text-gray-700">
              Are you sure you want to delete this product?
            </p>
            <div className="modal-action flex justify-end gap-3">
              <button
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                onClick={handleDeleteItem}
              >
                Confirm
              </button>
            </div>
          </div>
        </dialog>
      )}

      <ToastContainer
        position="top-left"
        autoClose={2000}
        hideProgressBar={true}
      />
    </div>
  );
};

export default Cart;

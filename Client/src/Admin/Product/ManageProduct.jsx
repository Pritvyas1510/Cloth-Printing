import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../../Axios/AxiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const colorStyles = {
    Red: "bg-red-500",
    Blue: "bg-blue-500",
    Green: "bg-green-500",
    Black: "bg-black",
    White: "bg-white border border-gray-300",
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
    Olive: "bg-olive-600",
    Lime: "bg-lime-500",
    Silver: "bg-gray-300",
    Gold: "bg-yellow-600",
  };

  // Base URL for images
  const BASE_URL = import.meta.env.BACKEND_URI || "http://localhost:5000";

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await AxiosInstance.get("/api/products");
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch products");
        setLoading(false);
        toast.error("Error fetching products", { position: "top-right" });
      }
    };
    fetchProducts();
  }, []);

  // Handle product card click
  const handleCardClick = (id) => {
    navigate(`/viewproduct/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Manage Products
          </h1>
          <button
            onClick={() => navigate("/addproduct")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Add New Product
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => handleCardClick(product._id)}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition-transform duration-300 border border-gray-200 cursor-pointer"
              >
                <div className="mb-4 relative">
                  <img
                    src={
                      product.images[0]
                        ? product.images[0] // already Cloudinary secure_url
                        : "https://via.placeholder.com/200"
                    }
                    alt={product.title}
                    className="w-full h-56 object-contain rounded-lg"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/200")
                    }
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-gray-100/30 to-transparent rounded-lg"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h3>
                <p className="text-gray-600 mb-2">
                  <strong>Price:</strong> ₹{product.price.toFixed(2)}
                  <sup>
                    {" "}
                    {product.discount > 0 && (
                      <span className="ml-2 bg-red-100 text-md text-red-600 font-bold px-2 rounded-3xl">
                        {product.discount}%
                      </span>
                    )}
                  </sup>
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Sizes:</strong> {product.size.join(", ") || "None"}
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Colors:</strong>
                </p>
                <div className="flex gap-2 mb-4">
                  {product.color.map((color) => (
                    <span
                      key={color}
                      className={`w-7 h-7 rounded-full ${
                        colorStyles[color]
                      } border-2 ${
                        color === "White"
                          ? "border-gray-300"
                          : "border-gray-500"
                      }`}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <ToastContainer position="bottom-left" autoClose={2000} />
      </div>
    </div>
  );
};

export default ManageProduct;

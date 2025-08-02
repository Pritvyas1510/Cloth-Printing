import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AxiosInstance from "../../Axios/AxiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(true);
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

  const BASE_URL = import.meta.env.VITE_BACKEND_URI || "http://localhost:5000";

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await AxiosInstance.get(`/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch product");
        setLoading(false);
        toast.error("Error fetching product", { position: "top-left" });
      }
    };
    fetchProduct();
  }, [id]);

  // Automatic slider with fade
  useEffect(() => {
    if (!product || product.images.length <= 1) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
        );
        setFade(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [product]);

  const handleNextImage = () => {
    if (product && currentImageIndex < product.images.length - 1) {
      setFade(false);
      setTimeout(() => {
        setCurrentImageIndex((prev) => prev + 1);
        setFade(true);
      }, 300);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setFade(false);
      setTimeout(() => {
        setCurrentImageIndex((prev) => prev - 1);
        setFade(true);
      }, 300);
    }
  };

  const handleDelete = async () => {
    try {
      await AxiosInstance.delete(`/api/products/${id}`);
      toast.success("Product deleted successfully", { position: "top-left" });
      navigate("/manageproduct");
    } catch (err) {
      toast.error("Failed to delete product", { position: "top-left" });
    } finally {
      document.getElementById("delete_modal").close();
    }
  };

  const handleEdit = () => {
    navigate(`/editproduct/${id}`);
  };

  const openDeleteModal = () => {
    document.getElementById("delete_modal").showModal();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="fixed top-4 left-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md w-80 z-50">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !product ? (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
            Product not found.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 lg:flex gap-10">
            {/* Image Slider */}
            <div className="lg:w-1/2">
              <div className="relative mb-4 overflow-hidden rounded-lg shadow-md">
                <img
                  key={currentImageIndex}
                  src={
                    product.images[currentImageIndex]
                      ? `${BASE_URL}/${product.images[currentImageIndex]}`
                      : "https://via.placeholder.com/600"
                  }
                  alt={product.title}
                  className={`w-full h-[400px] object-contain transition-opacity duration-500 ease-in-out ${
                    fade ? "opacity-100" : "opacity-0"
                  }`}
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/600")
                  }
                />
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      disabled={currentImageIndex === 0}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      &larr;
                    </button>
                    <button
                      onClick={handleNextImage}
                      disabled={currentImageIndex === product.images.length - 1}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      &rarr;
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={`${BASE_URL}/${image}`}
                    alt={`Thumbnail ${index}`}
                    className={`w-20 h-20 object-contain rounded-md cursor-pointer ${
                      index === currentImageIndex
                        ? "border-2 border-blue-600 shadow-lg"
                        : "border border-gray-200 hover:border-blue-400"
                    }`}
                    onClick={() => {
                      setFade(false);
                      setTimeout(() => {
                        setCurrentImageIndex(index);
                        setFade(true);
                      }, 300);
                    }}
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/100")
                    }
                  />
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:w-1/2 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h2>
                <div className="flex items-center gap-4 mb-4">
                  <p className="text-2xl text-green-600 font-semibold">
                    ₹{product.price.toFixed(2)}
                  </p>
                 
                </div>
                <p className="text-gray-700 mb-4">
                  {product.description || "No description available."}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Sizes
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {product.size.map((size) => (
                    <span
                      key={size}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-full text-gray-700 text-sm font-medium"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Colors
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {product.color.map((color) => (
                    <span
                      key={color}
                      className={`w-8 h-8 rounded-full ${
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

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Edit Product
                </button>
                <button
                  onClick={openDeleteModal}
                  className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition duration-200"
                >
                  Delete Product
                </button>
                <button
                  onClick={() => navigate("/manageproduct")}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
                >
                  Back to Products
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        <dialog
          id="delete_modal"
          className="modal modal-bottom sm:modal-middle"
        >
          <div className="modal-box bg-white rounded-xl p-6 shadow-2xl">
            <h3 className="font-bold text-xl text-gray-900">Confirm Delete</h3>
            <p className="py-4 text-gray-700">
              Are you sure you want to delete this product?
            </p>
            <div className="modal-action flex justify-end gap-3">
              <form method="dialog">
                <button className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200">
                  Cancel
                </button>
              </form>
              <button
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                onClick={handleDelete}
              >
                Confirm
              </button>
            </div>
          </div>
        </dialog>

        <ToastContainer position="top-left" autoClose={3000} />
      </div>
    </div>
  );
};

export default ViewProduct;

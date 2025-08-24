import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AxiosInstance from "../../Axios/AxiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(true);

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
        toast.error("Error fetching product", { position: "bottom-left" });
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
      toast.success("Product deleted successfully", {
        position: "bottom-left",
      });
      navigate("/manageproduct");
    } catch (err) {
      toast.error("Failed to delete product", { position: "bottom-left" });
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

  // Render star rating with auto-highlight based on average
  const renderRating = (average, count) => {
    const stars = Math.round(average); // Round to the nearest whole number
    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-5 h-5 ${
                star <= stars ? "text-yellow-400" : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-gray-600 text-sm">({count} reviews)</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto min-h-[calc(100vh-3rem)]">
        {error && (
          <div className="fixed top-4 left-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md w-80 z-50">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : !product ? (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
            Product not found.
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 lg:flex items-start gap-10 min-h-screen">
            {/* Image Slider */}
            <div className="lg:w-1/2 min-h-screen sticky top-4 self-start">
              <div className="relative mb-4 overflow-hidden rounded-lg shadow-md">
                <img
                  key={currentImageIndex}
                  src={
                    product.images[currentImageIndex]
                      ? product.images[currentImageIndex] // ✅ direct Cloudinary URL
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
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      &larr;
                    </button>
                    <button
                      onClick={handleNextImage}
                      disabled={currentImageIndex === product.images.length - 1}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    src={image} // ✅ already Cloudinary secure_url
                    alt={`Thumbnail ${index}`}
                    className={`w-20 h-20 object-contain rounded-md cursor-pointer ${
                      index === currentImageIndex
                        ? "border-2 border-purple-600 shadow-lg"
                        : "border border-gray-200 hover:border-purple-400"
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
                  <p className="text-2xl text-purple-600 font-semibold">
                    ₹{product.price.toFixed(2)}
                    <sup>
                      {product.discount > 0 && (
                        <span className="ml-2 bg-red-100 text-md text-red-600 font-bold px-2 rounded-3xl">
                          {product.discount}%
                        </span>
                      )}
                    </sup>
                  </p>
                  {product.rating &&
                    renderRating(product.rating.average, product.rating.count)}
                </div>
                <p className="text-gray-700 mb-4">
                  {product.description || "No description available."}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Category
                </h3>
                <p className="text-gray-700">
                  {product.category || "Not specified"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Material
                </h3>
                <p className="text-gray-700">
                  {product.material || "Not specified"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Stock Quantity
                </h3>
                <p className="text-gray-700">{product.stockQuantity || 0}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Brand
                </h3>
                <p className="text-gray-700">
                  {product.brand || "Not specified"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Weight
                </h3>
                <p className="text-gray-700">
                  {product.weight ? `${product.weight} grams` : "Not specified"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Dimensions
                </h3>
                <p className="text-gray-700">
                  {product.dimensions?.length &&
                  product.dimensions?.width &&
                  product.dimensions?.height
                    ? `${product.dimensions.length} x ${product.dimensions.width} x ${product.dimensions.height} cm`
                    : "Not specified"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Status
                </h3>
                <p className="text-gray-700">
                  {product.isActive ? "Active" : "Inactive"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Specifications
                </h3>
                {product.specifications &&
                Object.keys(product.specifications).length > 0 ? (
                  <ul className="list-disc pl-5 text-gray-700">
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <li key={key}>
                          <strong>{key}:</strong> {value}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-700">Not specified</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Tags
                </h3>
                <p className="text-gray-700">
                  {product.tags.length > 0
                    ? product.tags.join(", ")
                    : "Not specified"}
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
                  className="bg-purple-600 text-white px-5 py-2 rounded-md hover:bg-purple-700 transition duration-200"
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

        <ToastContainer position="bottom-left" autoClose={2000} />
      </div>
    </div>
  );
};

export default ViewProduct;

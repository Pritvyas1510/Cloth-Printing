import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AxiosInstance from "../../../Axios/AxiosInstance";
import { ToastContainer, toast } from "react-toastify";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [designDescription, setDesignDescription] = useState("");
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.BACKEND_URI;

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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await AxiosInstance.get(`/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch product details");
        setLoading(false);
        toast.error("Error fetching product details", { position: "top-left" });
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [product]);

  const handleQuantityChange = (e) => {
    const value = e.target.value;

    // Allow temporary empty input
    if (value === "") {
      setQuantity("");
      return;
    }

    const parsedValue = parseInt(value, 10);

    if (!isNaN(parsedValue)) {
      if (product && product.stock) {
        if (parsedValue > product.stock) {
          toast.error(`Only ${product.stock} items in stock`, {
            position: "top-left",
          });
          setQuantity(product.stock);
        } else if (parsedValue < 1) {
          setQuantity(1);
        } else {
          setQuantity(parsedValue);
        }
      } else {
        setQuantity(Math.max(1, parsedValue));
      }
    }
  };

  const handleQuantityBlur = () => {
    if (quantity === "" || quantity < 1) {
      setQuantity(1);
    }
  };

  const handleSizeSelect = (size) => setSelectedSize(size);
  const handleColorSelect = (color) => setSelectedColor(color);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setUploadedImage(URL.createObjectURL(file));
    } else {
      toast.error("Please upload a valid image file", { position: "top-left" });
    }
  };

  const getImageUrl = (image) => {
    if (!image) return "https://via.placeholder.com/600";
    return image.startsWith("http") ? image : `${BASE_URL}/${image}`;
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select a size and color", { position: "top-left" });
      return;
    }

    const fileInput = document.querySelector('input[type="file"]');
    if (!fileInput || !fileInput.files[0]) {
      toast.error("Please upload a custom design image", {
        position: "top-left",
      });
      return;
    }

    const formData = new FormData();
    formData.append("productId", id);
    formData.append("title", product.title);
    formData.append("price", product.price);
    formData.append("color", selectedColor);
    formData.append("size", selectedSize);
    formData.append("quantity", quantity);
    formData.append("designDescription", designDescription);
    if (fileInput.files[0]) {
      formData.append("customDesign", fileInput.files[0]);
    }

    try {
      const sessionId =
        localStorage.getItem("sessionId") ||
        `guest_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("sessionId", sessionId);

      await AxiosInstance.post("/api/cart/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-session-id": sessionId,
        },
      });

      toast.success(`Added ${product.title} to cart`, {
        position: "top-left",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error adding to cart";
      toast.error(errorMessage, { position: "top-left" });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-white py-6 px-3 sm:py-10 sm:px-6">
      <div className="w-full max-w-6xl bg-gray-50 rounded-2xl p-4 sm:p-6 md:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 font-sans text-[#0d141c]">
        {error && (
          <div className="fixed top-4 left-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md w-80 z-50">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64 col-span-2">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0d141c]"></div>
          </div>
        ) : !product ? (
          <div className="col-span-2 text-center text-red-600">
            Product not found
          </div>
        ) : (
          <>
            {/* Image Section */}
            <div className="flex flex-col gap-4 md:gap-6 md:sticky md:top-24 md:self-start">
              <div className="w-full h-[250px] sm:h-[350px] md:h-[400px] flex items-center justify-center bg-white rounded-xl overflow-hidden">
                <img
                  src={getImageUrl(product.images[currentImageIndex])}
                  alt={product.title}
                  className="h-full w-auto max-w-full object-contain transition-transform duration-300 hover:scale-105"
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/600")
                  }
                />
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={getImageUrl(image)}
                    alt={`Thumb ${index}`}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg cursor-pointer border ${
                      index === currentImageIndex
                        ? "border-[#0d141c] shadow-lg"
                        : "border-[#cedbe8] hover:border-[#0d141c]"
                    } transition`}
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/100")
                    }
                  />
                ))}

                {uploadedImage && (
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg border border-[#cedbe8] hover:border-[#0d141c]"
                  />
                )}
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold text-[#0d141c] mb-2">
                  Upload Custom Design
                </h3>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-[#49739c] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#0d141c] file:text-white file:hover:bg-gray-800"
                />
              </div>
            </div>

            {/* Details Section */}
            <div className="flex flex-col justify-between space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words">
                  {product.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <p className="text-2xl sm:text-3xl text-green-600 font-semibold">
                    ₹{product.price.toFixed(2)}
                  </p>
                  <p className="text-lg sm:text-xl text-gray-500 line-through">
                    ₹{(product.price * 1.2).toFixed(2)}
                  </p>
                  <p className="text-lg sm:text-xl text-red-600 font-semibold">
                    {product.discount}% OFF
                  </p>
                </div>

                {/* Description */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 break-words">
                    {product.description || "No description available"}
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Category */}
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                      Category
                    </h3>
                    <p className="text-gray-700 break-words">
                      {product.category || "Not specified"}
                    </p>
                  </div>

                  {/* Material */}
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                      Material
                    </h3>
                    <p className="text-gray-700 break-words">
                      {product.material || "Not specified"}
                    </p>
                  </div>

                  {/* Stock Quantity */}
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                      Stock Quantity
                    </h3>
                    <p className="text-gray-700 break-words">
                      {product.stock || "Not specified"}
                    </p>
                  </div>

                  {/* Brand */}
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                      Brand
                    </h3>
                    <p className="text-gray-700 break-words">
                      {product.brand || "Not specified"}
                    </p>
                  </div>

                  {/* Weight */}
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                      Weight
                    </h3>
                    <p className="text-gray-700 break-words">
                      {product.weight
                        ? `${product.weight} grams`
                        : "Not specified"}
                    </p>
                  </div>

                  {/* Dimensions */}
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                      Dimensions
                    </h3>
                    <p className="text-gray-700 break-words">
                      {product.dimensions
                        ? `${product.dimensions.length} x ${product.dimensions.width} x ${product.dimensions.height} cm`
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Specifications */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    Specifications
                  </h3>
                  {product.specifications &&
                  Object.keys(product.specifications).length > 0 ? (
                    <ul className="list-disc pl-5 text-gray-700 space-y-1 break-words">
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

                {/* Tags */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    Tags
                  </h3>
                  <p className="text-gray-700 break-words">
                    {product.tags.length > 0
                      ? product.tags.join(", ")
                      : "Not specified"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 sm:space-y-6">
                {/* Sizes */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    Sizes
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {product.size.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        className={`px-4 sm:px-5 py-2 rounded-full ${
                          selectedSize === size
                            ? "bg-[#0d141c] text-white"
                            : "bg-white border border-[#cedbe8] text-[#0d141c] hover:bg-gray-100"
                        } transition`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    Colors
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.color.map((color) => (
                      <div
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
                          colorStyles[color] || "bg-gray-300"
                        } cursor-pointer border-2 transition-all duration-200 ease-in-out ${
                          selectedColor === color
                            ? "border-[#0d141c] shadow-md scale-110 ring-2 ring-offset-2 ring-[#0d141c]"
                            : "border-[#cedbe8] hover:scale-105 hover:shadow-sm"
                        }`}
                        title={color}
                      >
                        {selectedColor === color && (
                          <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                            ✔
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-3">
                  <label className="text-base sm:text-lg font-medium">
                    Quantity:
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    onBlur={handleQuantityBlur}
                    min="1"
                    max={product?.stock || 1000}
                    className="w-16 sm:w-20 p-2 sm:p-3 rounded-lg border border-[#cedbe8] bg-gray-50 focus:border-[#0d141c]"
                  />
                </div>

                {/* Design Requirements */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    Design Requirements
                  </h3>
                  <textarea
                    value={designDescription}
                    onChange={(e) => setDesignDescription(e.target.value)}
                    placeholder="Enter design instructions (e.g., 'Print in bold, center-aligned')"
                    className="w-full p-3 rounded-lg border border-[#cedbe8] bg-gray-50 focus:border-[#0d141c] resize-y"
                    rows="4"
                  />
                </div>

                {/* Buttons */}
                {product.isActive ? (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-[#0d141c] text-white text-lg sm:text-xl font-semibold py-3 sm:py-4 rounded-lg hover:bg-gray-800 transition"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 text-lg sm:text-xl font-semibold py-3 sm:py-4 rounded-lg cursor-not-allowed"
                  >
                    Not Available
                  </button>
                )}
                <button
                  onClick={() => navigate("/design")}
                  className="w-full bg-[#0d141c] text-white text-lg sm:text-xl font-semibold py-3 sm:py-4 rounded-lg hover:bg-gray-800 transition"
                >
                  Back
                </button>
              </div>
            </div>
          </>
        )}

        <ToastContainer
          position="top-left"
          autoClose={2000}
          hideProgressBar={true}
        />
      </div>
    </section>
  );
};

export default ProductDetails;

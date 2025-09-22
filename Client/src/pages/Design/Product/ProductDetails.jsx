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
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, Math.min(10, value)));
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

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
    <section className="min-h-screen flex items-center justify-center bg-white py-10 px-4">
      <div className="max-w-6xl w-full bg-gray-50 rounded-2xl p-10 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-10 font-sans text-[#0d141c]">
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
            <div className="flex flex-col gap-6 md:sticky md:top-24 md:self-start">
              <div className="w-full h-[400px] flex items-center justify-center bg-white rounded-xl overflow-hidden">
                <img
                  src={getImageUrl(product.images[currentImageIndex])}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/600")
                  }
                />
              </div>

              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={getImageUrl(image)}
                    alt={`Thumb ${index}`}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 object-contain rounded-lg cursor-pointer border ${
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
                    className="w-20 h-20 object-contain rounded-lg border border-[#cedbe8] hover:border-[#0d141c]"
                  />
                )}
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-[#0d141c] mb-2">
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
            <div className="flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold">{product.title}</h1>
                <div className="flex items-center space-x-4">
                  <p className="text-3xl text-green-600 font-semibold">
                    ₹{product.price.toFixed(2)}
                  </p>
                  <p className="text-xl text-gray-500 line-through">
                    ₹{(product.price * 1.2).toFixed(2)}
                  </p>
                  <p className="text-xl text-red-600 font-semibold">
                    {product.discount}% OFF
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">
                    {product.description || "No description available"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Category</h3>
                    <p className="text-gray-700">
                      {product.category || "Not specified"}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Material</h3>
                    <p className="text-gray-700">
                      {product.material || "Not specified"}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">
                      Stock Quantity
                    </h3>
                    <p className="text-gray-700">
                      {product.stockQuantity || 0}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Brand</h3>
                    <p className="text-gray-700">
                      {product.brand || "Not specified"}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Weight</h3>
                    <p className="text-gray-700">
                      {product.weight
                        ? `${product.weight} grams`
                        : "Not specified"}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Dimensions</h3>
                    <p className="text-gray-700">
                      {product.dimensions?.length &&
                      product.dimensions?.width &&
                      product.dimensions?.height
                        ? `${product.dimensions.length} x ${product.dimensions.width} x ${product.dimensions.height} cm`
                        : "Not specified"}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm col-span-2">
                    <h3 className="text-xl font-semibold mb-2">
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
                  <div className="bg-white p-6 rounded-xl shadow-sm col-span-2">
                    <h3 className="text-xl font-semibold mb-2">Tags</h3>
                    <p className="text-gray-700">
                      {product.tags.length > 0
                        ? product.tags.join(", ")
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">Sizes</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.size.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        className={`px-5 py-2 rounded-full ${
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

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">Colors</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.color.map((color) => (
                      <div
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className={`relative w-10 h-10 rounded-full ${
                          colorStyles[color] || "bg-gray-300"
                        } cursor-pointer border-2 transition-all duration-200 ease-in-out ${
                          selectedColor === color
                            ? "border-[#0d141c] shadow-[0_0_8px_rgba(0,0,0,0.3)] scale-125 ring-2 ring-offset-2 ring-[#0d141c]"
                            : "border-[#cedbe8] hover:scale-110 hover:shadow-[0_0_6px_rgba(0,0,0,0.2)]"
                        }`}
                        title={color}
                      >
                        {selectedColor === color && (
                          <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                            <svg
                              className="w-5 h-5"
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
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="text-lg font-medium">Quantity:</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max="10"
                    className="w-20 p-3 rounded-lg border border-[#cedbe8] bg-gray-50 focus:border-[#0d141c]"
                  />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">
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

                {product.isActive ? (
                  <button
                    onClick={handleAddToCart}
                    className="block bg-[#0d141c] text-white w-full text-center text-xl font-semibold py-4 rounded-lg hover:bg-gray-800 transition"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <button
                    disabled
                    className="block bg-gray-300 text-gray-500 w-full text-center text-xl font-semibold py-4 rounded-lg cursor-not-allowed"
                  >
                    Not Available
                  </button>
                )}
                <button
                  onClick={() => navigate("/design")}
                  className="block bg-[#0d141c] text-white w-full text-center text-xl font-semibold py-4 rounded-lg hover:bg-gray-800 transition"
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

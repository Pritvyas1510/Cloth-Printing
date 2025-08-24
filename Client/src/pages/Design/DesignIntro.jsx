import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

const DesignIntro = ({ products, loading, onSelectProduct }) => {
  const BASE_URL = import.meta.env.BACKEND_URI || "http://localhost:5000";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [tempSizes, setTempSizes] = useState([]);
  const [tempColors, setTempColors] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
    Olive: "bg-olive-600",
    Lime: "bg-lime-500",
    Silver: "bg-gray-300",
    Gold: "bg-yellow-600",
  };

  // Extract unique sizes and colors for filters
  const availableSizes = useMemo(() => {
    const sizes = new Set();
    products.forEach((product) =>
      product.size.forEach((size) => sizes.add(size))
    );
    return Array.from(sizes).sort();
  }, [products]);

  const availableColors = useMemo(() => {
    const colors = new Set();
    products.forEach((product) =>
      product.color.forEach((color) => colors.add(color))
    );
    return Array.from(colors).sort();
  }, [products]);

  // Filter products based on search query and selected filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesSize =
        selectedSizes.length === 0 ||
        selectedSizes.some((size) => product.size.includes(size));
      const matchesColor =
        selectedColors.length === 0 ||
        selectedColors.some((color) => product.color.includes(color));
      return matchesSearch && matchesSize && matchesColor;
    });
  }, [products, searchQuery, selectedSizes, selectedColors]);

  // Generate search suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery) return [];
    return products
      .filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((product) => product.title)
      .slice(0, 5);
  }, [products, searchQuery]);

  const handleSizeToggle = (size) => {
    setTempSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (color) => {
    setTempColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setIsSearchFocused(false);
  };

  const openFilterModal = () => {
    setTempSizes(selectedSizes);
    setTempColors(selectedColors);
    document.getElementById("filter_modal").showModal();
  };

  const applyFilters = () => {
    setSelectedSizes(tempSizes);
    setSelectedColors(tempColors);
    document.getElementById("filter_modal").close();
  };

  const clearFilters = () => {
    setTempSizes([]);
    setTempColors([]);
  };

  // Calculate discount dynamically
  const calculateDiscount = (price) => {
    const originalPrice = price / 0.8; // Assuming 20% discount as baseline (adjust if backend provides discount)
    const discount = ((originalPrice - price) / originalPrice) * 100;
    return discount > 0 ? Math.round(discount) : 0;
  };

  const getOriginalPrice = (price, discount) => {
    if (discount > 0) {
      return (price / (1 - discount / 100)).toFixed(2);
    }
    return (price * 1.2).toFixed(2); // Default 20% higher if no discount
  };

  return (
    <section className="bg-blue-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="relative flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search by product name..."
              className="flex-1 p-3 rounded-lg border border-[#cedbe8] bg-slate-50 text-[#0d141c] focus:outline-none focus:border-[#0d141c] placeholder:text-[#49739c] text-base"
            />
            {isSearchFocused && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-[#cedbe8] rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto top-full">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-3 text-[#0d141c] hover:bg-slate-50 cursor-pointer"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={openFilterModal}
              className="bg-[#0d141c] text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition duration-200"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0d141c]"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mx-4">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const discount = calculateDiscount(product.price);
              const originalPrice = getOriginalPrice(product.price, discount);
              return (
                <Link
                  key={product._id}
                  to={`/productdetails/${product._id}`}
                  className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition duration-300 transform hover:-translate-y-1 block"
                >
                  <img
                    src={product.images[0] || "https://via.placeholder.com/300"}
                    alt={product.title}
                    className="w-full h-48 object-contain rounded-lg mb-4"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/300")
                    }
                  />

                  <h3 className="text-xl font-semibold text-[#0d141c] mb-2 truncate">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-lg text-green-600 font-semibold">
                      ₹{product.price.toFixed(2)}
                    </p>
                    {discount > 0 && (
                      <>
                        <span className="text-sm text-[#49739c] line-through">
                          ₹{originalPrice}
                        </span>
                        <span className="text-sm text-red-600 font-semibold">
                          {product.discount}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mb-3">
                    <p className="text-[#0d141c] text-sm font-medium mb-1">
                      Sizes:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.size.map((size) => (
                        <span
                          key={size}
                          className="px-2 py-1 bg-slate-50 border border-[#cedbe8] rounded-full text-[#49739c] text-xs font-medium"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-[#0d141c] text-sm font-medium mb-1">
                      Colors:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.color.map((color) => (
                        <span
                          key={color}
                          className={`w-6 h-6 rounded-full ${
                            colorStyles[color]
                          } border-2 ${
                            color === "White"
                              ? "border-[#cedbe8]"
                              : "border-[#0d141c]"
                          } hover:scale-105 transition duration-200`}
                          title={color}
                        ></span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Filter Modal */}
        <dialog
          id="filter_modal"
          className="modal modal-bottom sm:modal-middle"
        >
          <div className="modal-box bg-white rounded-xl p-6 shadow-xl">
            <h3 className="font-bold text-xl text-[#0d141c] mb-4">
              Filter Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-[#0d141c] font-semibold text-base mb-2">
                  Sizes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border transition duration-200 ${
                        tempSizes.includes(size)
                          ? "bg-[#0d141c] text-white border-[#0d141c]"
                          : "bg-white text-[#0d141c] border-[#cedbe8] hover:bg-slate-50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[#0d141c] font-semibold text-base mb-2">
                  Colors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorToggle(color)}
                      className={`w-8 h-8 rounded-full border-2 transition duration-200 ${
                        tempColors.includes(color)
                          ? "border-[#0d141c]"
                          : "border-[#cedbe8]"
                      } ${colorStyles[color]} hover:scale-105`}
                      title={color}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-action flex justify-end gap-3 mt-6">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-[#e7edf4] text-[#0d141c] rounded-lg hover:bg-gray-300 transition duration-200"
              >
                Clear Filters
              </button>
              <form method="dialog">
                <button className="px-4 py-2 bg-[#e7edf4] text-[#0d141c] rounded-lg hover:bg-gray-300 transition duration-200">
                  Cancel
                </button>
              </form>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-[#0d141c] text-white rounded-lg hover:bg-gray-800 transition duration-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </section>
  );
};

export default DesignIntro;

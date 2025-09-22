import React, { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../../Axios/AxiosInstance";

const AllProduct = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const BASE_URL = import.meta.env.BACKEND_URI;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      fetchAllProducts();
    }
  }, [isAuthenticated, navigate]);

  const fetchAllProducts = async () => {
    try {
      const response = await AxiosInstance.get("/api/products");
      setAllProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setSuggestions([]);
    } else {
      const filtered = allProducts.filter((product) => {
        const inTitle = product.title
          .toLowerCase()
          .includes(value.toLowerCase());
        const inColor = product.color?.some((c) =>
          c.toLowerCase().includes(value.toLowerCase())
        );
        const inSize = product.size?.some((s) =>
          s.toLowerCase().includes(value.toLowerCase())
        );
        return inTitle || inColor || inSize;
      });
      setSuggestions(filtered);
    }
  };

  const handleSuggestionClick = (product) => {
    setSearchTerm(product.title);
    setSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-10 max-w-2xl mx-auto">
          <div className="flex items-center border border-gray-300 rounded-lg shadow-sm bg-white transition-all duration-200 ease-in-out focus-within:ring-2 focus-within:ring-blue-500">
            <span className="px-3 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by title, color or size..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-3 text-gray-800 placeholder-gray-400 outline-none"
            />
          </div>

          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-all duration-200 ease-in-out">
              {suggestions.map((product) => (
                <li
                  key={product._id}
                  onClick={() => handleSuggestionClick(product)}
                  className="px-4 py-2 hover:bg-blue-50 hover:font-medium text-gray-800 cursor-pointer transition duration-150 ease-in-out"
                >
                  {product.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Product List */}
        {allProducts.length === 0 ? (
          <p className="text-center text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {allProducts
              .filter((product) => {
                const lower = searchTerm.toLowerCase();
                return (
                  product.title.toLowerCase().includes(lower) ||
                  product.color?.some((c) => c.toLowerCase().includes(lower)) ||
                  product.size?.some((s) => s.toLowerCase().includes(lower))
                );
              })
              .map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ease-in-out"
                >
                  <img
                    src={product.images[0] || "https://via.placeholder.com/200"}
                    alt={product.title}
                    className="w-full h-56 object-contain bg-gray-50 p-4"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/200")
                    }
                  />

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                    <p className="mt-3 text-blue-600 font-semibold text-base">
                      ₹ {product.price}
                    </p>

                    {/* Sizes */}
                    {product.size?.length > 0 && (
                      <p className="text-sm mt-2 text-gray-700">
                        <strong>Sizes:</strong> {product.size.join(", ")}
                      </p>
                    )}

                    {/* Colors */}
                    {product.color?.length > 0 && (
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="text-sm text-gray-700 font-medium">
                          Colors:
                        </span>
                        {product.color.map((clr) => (
                          <span
                            key={clr}
                            title={clr}
                            className={`w-5 h-5 rounded-full border ${
                              clr.toLowerCase() === "white"
                                ? "bg-white border-gray-400"
                                : `bg-${clr.toLowerCase()}-500`
                            }`}
                            style={{ backgroundColor: clr.toLowerCase() }}
                          ></span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProduct;

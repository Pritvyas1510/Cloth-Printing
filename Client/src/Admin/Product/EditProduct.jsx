import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from '../../Axios/AxiosInstance';
import { useAuth } from '../../AuthContext/AuthContext';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    size: [],
    color: [],
  });
  const [images, setImages] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const sizes = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"];
  const colors = [
    "Red", "Blue", "Green", "Black", "White", "Yellow", "Orange", "Purple",
    "Pink", "Brown", "Gray", "Cyan", "Magenta", "Navy", "Teal", "Maroon",
    "Olive", "Lime", "Silver", "Gold"
  ];

  const colorStyles = {
    Red: 'bg-red-500', Blue: 'bg-blue-500', Green: 'bg-green-500', Black: 'bg-black',
    White: 'bg-white border border-gray-300', Yellow: 'bg-yellow-500', Orange: 'bg-orange-500',
    Purple: 'bg-purple-500', Pink: 'bg-pink-500', Brown: 'bg-amber-700', Gray: 'bg-gray-500',
    Cyan: 'bg-cyan-500', Magenta: 'bg-fuchsia-500', Navy: 'bg-indigo-900', Teal: 'bg-teal-500',
    Maroon: 'bg-red-900', Olive: 'bg-olive-600', Lime: 'bg-lime-500', Silver: 'bg-gray-300',
    Gold: 'bg-yellow-600'
  };

  const BASE_URL = import.meta.env.VITE_BACKEND_URI || 'http://localhost:5000';

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await AxiosInstance.get(`/api/products/${id}`);
        const { title, description, price, size, color, images } = response.data;
        setFormData({ title, description, price: price.toString(), size, color });
        setCurrentImages(images);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch product');
        setLoading(false);
        toast.error('Error fetching product', { position: 'top-right' });
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const newValues = checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value);
      return { ...prev, [field]: newValues };
    });
  };

  const handleImageChange = (e) => {
    const selectedFiles = [...e.target.files].slice(0, 10 - currentImages.length);
    setImages((prev) => [...prev, ...selectedFiles]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeCurrentImage = (index) => {
    setCurrentImages(currentImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setError('You must be logged in to update a product');
      return;
    }
    if (formData.price < 0) {
      setError('Price cannot be negative');
      return;
    }
    if (currentImages.length + images.length === 0) {
      setError('Please select at least one image');
      return;
    }
    if (currentImages.length + images.length > 10) {
      setError('Cannot upload more than 10 images');
      return;
    }
    if (formData.size.length === 0) {
      setError('Please select at least one size');
      return;
    }
    if (formData.color.length === 0) {
      setError('Please select at least one color');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    formData.size.forEach((size) => data.append('size[]', size));
    formData.color.forEach((color) => data.append('color[]', color));
    images.forEach((image) => data.append('images', image));
    currentImages.forEach((image) => data.append('currentImages[]', image));

    try {
      await AxiosInstance.put(`/api/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Product updated successfully!', {
        position: 'bottom-left',
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate('/manageproduct');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating product. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Edit Product</h2>
          <button
            onClick={() => navigate('/manageproduct')}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
          >
            Back to Products
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
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                  placeholder="Enter product title"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                  placeholder="Enter price (e.g., 29.99)"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                rows={4}
                placeholder="Enter product description"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Sizes</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <label key={size}>
                    <input
                      type="checkbox"
                      name="size"
                      value={size}
                      checked={formData.size.includes(size)}
                      onChange={(e) => handleCheckboxChange(e, 'size')}
                      className="hidden"
                    />
                    <span
                      className={`px-4 py-2 border rounded-lg cursor-pointer text-sm font-medium transition
                        ${formData.size.includes(size)
                          ? 'bg-blue-500 text-white border-blue-500 scale-105 shadow-md'
                          : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-50 hover:shadow-lg'}
                      `}
                    >
                      {size}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Colors</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                {colors.map((color) => (
                  <label key={color} className="flex flex-col items-center space-y-1">
                    <input
                      type="checkbox"
                      name="color"
                      value={color}
                      checked={formData.color.includes(color)}
                      onChange={(e) => handleCheckboxChange(e, 'color')}
                      className="hidden"
                    />
                    <span
                      className={`relative w-8 h-8 rounded-full border-2 cursor-pointer transition-all duration-200
                        ${formData.color.includes(color)
                          ? 'border-blue-500 scale-125 shadow-xl ring-2 ring-blue-300'
                          : 'border-gray-300 hover:scale-110 hover:shadow-lg'}
                        ${colorStyles[color]}
                      `}
                      title={color}
                    >
                      {formData.color.includes(color) && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                          ✓
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-gray-700">{color}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Product Images (max 10)</label>
              <input
                type="file"
                name="images"
                id="images"
                onChange={handleImageChange}
                multiple
                accept="image/*"
                className="hidden"
              />
              <label
                htmlFor="images"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition"
              >
                {images.length > 0 ? `${images.length} new selected` : 'Choose New Images'}
              </label>
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New Preview ${index}`}
                        className="w-28 h-28 object-cover rounded-lg shadow"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {currentImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-700 mb-2 font-medium">Current Images</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {currentImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={`${BASE_URL}/${image}`}
                          alt={`Current Preview ${index}`}
                          className="w-28 h-28 object-cover rounded-lg shadow"
                          onError={(e) => (e.target.src = 'https://via.placeholder.com/200')}
                        />
                        <button
                          type="button"
                          onClick={() => removeCurrentImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              Update Product
            </button>
          </form>
        )}

        <ToastContainer position="bottom-left" />
      </div>
    </div>
  );
};

export default EditProduct;
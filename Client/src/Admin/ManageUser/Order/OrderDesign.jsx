import React, { useState, useEffect } from 'react';
import AxiosInstance from '../../../Axios/AxiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderDesign = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [product, setProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = import.meta.env.VITE_BACKEND_URI || 'http://localhost:5000';
  const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/das7xphnt/image/upload';

  useEffect(() => {
    const fetchOrderAndProduct = async () => {
      try {
        if (!orderId) {
          throw new Error('Order ID is missing');
        }
        console.log('Fetching order with ID:', orderId);

        const orderResponse = await AxiosInstance.get(`/api/orders/${orderId}`, {
          withCredentials: true,
          headers: {
            'x-session-id':
              localStorage.getItem('sessionId') ||
              `guest_${Math.random().toString(36).substr(2, 9)}`,
          },
        });
        const orderData = orderResponse.data;
        console.log('Fetched order:', orderData);
        setOrder(orderData);

        if (orderData.products && orderData.products.length > 0) {
          const firstProduct = orderData.products[0];
          const productId =
            typeof firstProduct.product === 'object' && firstProduct.product?._id
              ? firstProduct.product._id.toString()
              : firstProduct.product.toString();
          setSelectedProductId(productId);

          const productResponse = await AxiosInstance.get(`/api/products/${productId}`).catch(
            () => ({ data: null })
          );
          console.log('Fetched product:', productResponse.data);
          setProduct({
            ...firstProduct,
            additionalDetails: productResponse.data || {},
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to fetch order or product details');
        setLoading(false);
        toast.error(err.response?.data?.message || 'Failed to fetch order or product details', {
          position: 'top-left',
        });
      }
    };

    fetchOrderAndProduct();
  }, [orderId]);

  const handleProductSelect = async (productId) => {
    try {
      setSelectedProductId(productId);
      const productItem = order.products.find(
        (item) =>
          (typeof item.product === 'object' && item.product?._id
            ? item.product._id.toString()
            : item.product.toString()) === productId
      );
      if (!productItem) {
        throw new Error('Product not found in order');
      }

      const productResponse = await AxiosInstance.get(`/api/products/${productId}`).catch(
        () => ({ data: null })
      );
      console.log('Fetched product:', productResponse.data);
      setProduct({
        ...productItem,
        additionalDetails: productResponse.data || {},
      });
    } catch (err) {
      toast.error('Failed to load product details', { position: 'top-left' });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!imageFile || !selectedProductId) {
      toast.error('Please select a product and upload an image', { position: 'top-left' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('deliveredImage', imageFile);
      await AxiosInstance.post(
        `/api/orders/${orderId}/product/${selectedProductId}/upload-image`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-session-id':
              localStorage.getItem('sessionId') ||
              `guest_${Math.random().toString(36).substr(2, 9)}`,
          },
        }
      );

      await AxiosInstance.put(
        `/api/orders/${orderId}/status`,
        { status: 'design' },
        {
          withCredentials: true,
          headers: {
            'x-session-id':
              localStorage.getItem('sessionId') ||
              `guest_${Math.random().toString(36).substr(2, 9)}`,
          },
        }
      );

      toast.success('Image uploaded and order status updated to design', { position: 'top-left' });
      onClose();
    } catch (err) {
      console.error('Submit error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to upload image or update status', {
        position: 'top-left',
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl">
        <p className="text-red-500 text-base text-center">{error}</p>
        <button
          className="mt-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white p-2 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl">
        <p className="text-gray-600 text-base text-center">Order not found.</p>
        <button
          className="mt-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white p-2 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl">
      <button
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-all duration-300"
        onClick={onClose}
      >
        ✕
      </button>
      <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text mb-4 text-center">
        Design for Order #{order._id.slice(-6)}
      </h1>

      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 mb-2">Select Product</h3>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {order.products.map((item) => {
            const productId =
              typeof item.product === 'object' && item.product?._id
                ? item.product._id.toString()
                : item.product.toString();
            return (
              <button
                key={productId}
                className={`p-2 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${
                  selectedProductId === productId ? 'border-blue-600 shadow-md' : 'border-gray-200'
                }`}
                onClick={() => handleProductSelect(productId)}
              >
                <div className="flex items-center space-x-2">
                  {item.additionalDetails?.images?.[0] ? (
                    <img
                      src={`${BASE_URL}/${item.additionalDetails.images[0]}`}
                      alt={item.title}
                      className="w-10 h-10 object-cover rounded-md"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/50')}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
                      No Image
                    </div>
                  )}
                  <span className="text-xs font-medium text-gray-700 truncate">{item.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {product ? (
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex flex-col gap-4">
            <div>
              {product.additionalDetails?.images?.[0] ? (
                <img
                  src={`${BASE_URL}/${product.additionalDetails.images[0]}`}
                  alt={product.title}
                  className="w-48 h-48 object-cover rounded-lg shadow-sm"
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                />
              ) : (
                <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                  No Image
                </div>
              )}
            </div>
            {product.customDesign && (
              <div>
                <img
                  src={
                    product.customDesign.startsWith('http')
                      ? product.customDesign
                      : `${CLOUDINARY_BASE_URL}/${product.customDesign}`
                  }
                  alt="Custom Design"
                  className="w-48 h-48 object-cover rounded-lg shadow-sm"
                  onError={(e) => {
                    console.error(`Failed to load custom design image: ${product.customDesign}`);
                    e.target.src = 'https://via.placeholder.com/150';
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">{product.title}</h2>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Color:</span> {product.color || 'Not specified'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Size:</span> {product.size || 'Not specified'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Quantity:</span> {product.quantity}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Price:</span>{' '}
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                }).format(product.price)}
              </p>
              {product.designDescription && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Design Description:</span>{' '}
                  {product.designDescription}
                </p>
              )}
              {product.deliveredImage && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Delivered Image Status:</span>{' '}
                  {product.deliveredImageStatus.charAt(0).toUpperCase() +
                    product.deliveredImageStatus.slice(1)}
                </p>
              )}
              {product.rating && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Rating:</span>{' '}
                  {product.rating} Star{product.rating > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-sm text-center mb-4">
          Please select a product to view its design details.
        </p>
      )}

      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 mb-2">Upload Design Image</h3>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-600 transition-all duration-300"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
              setImageFile(file);
              const reader = new FileReader();
              reader.onloadend = () => setImagePreview(reader.result);
              reader.readAsDataURL(file);
            } else {
              toast.error('Please drop an image file', { position: 'top-left' });
            }
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="block text-sm text-gray-500 cursor-pointer"
          >
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-lg mx-auto"
                />
                <button
                  className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                  onClick={handleRemoveImage}
                >
                  ✕
                </button>
                <p className="mt-2 text-sm text-gray-600">
                  {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                </p>
              </div>
            ) : (
              <div>
                <p>Drag and drop an image here, or click to select</p>
                <p className="text-xs text-gray-400 mt-1">Supported formats: JPG, PNG</p>
              </div>
            )}
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 mb-4">
        <button
          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-2 px-4 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={uploading || !imageFile || !selectedProductId}
        >
          {uploading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Design'
          )}
        </button>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 mb-2">Order Summary</h3>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Order ID:</span> {order._id}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Placed on:</span>{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Total Amount:</span>{' '}
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
            }).format(order.totalAmount)}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Payment Method:</span> {order.paymentMethod}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Payment Status:</span>{' '}
            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
          </p>
        </div>
      </div>
      <ToastContainer position="top-left" autoClose={3000} />
    </div>
  );
};

export default OrderDesign;
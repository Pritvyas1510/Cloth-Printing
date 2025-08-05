import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from '../../Axios/AxiosInstance';
import { useAuth } from '../../AuthContext/AuthContext';
import * as Yup from 'yup';

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
    category: '',
    material: '',
    stockQuantity: '',
    discount: '',
    brand: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    isActive: true,
    specifications: [],
    tags: '',
  });
  const [images, setImages] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const sizes = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"];
  const colors = [
    "Red", "Blue", "Green", "Black", "White", "Yellow", "Orange", "Purple",
    "Pink", "Brown", "Gray", "Cyan", "Magenta", "Navy", "Teal", "Maroon",
    "Olive", "Lime", "Silver", "Gold"
  ];
  const categories = [
    "T-Shirt", "Shirt", "Jeans", "Jacket", "Sweater", "Dress", "Skirt",
    "Pants", "Shorts", "Hoodie", "Accessories", "Other"
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

  // Yup validation schema
  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required').trim(),
    description: Yup.string().trim(),
    price: Yup.number()
      .required('Price is required')
      .min(0, 'Price cannot be negative')
      .typeError('Price must be a number'),
    size: Yup.array()
      .min(1, 'At least one size is required')
      .of(Yup.string().oneOf(sizes, 'Invalid size')),
    color: Yup.array()
      .min(1, 'At least one color is required')
      .of(Yup.string().oneOf(colors, 'Invalid color')),
    category: Yup.string()
      .required('Category is required')
      .oneOf(categories, 'Invalid category'),
    material: Yup.string().trim(),
    stockQuantity: Yup.number()
      .required('Stock quantity is required')
      .min(0, 'Stock quantity cannot be negative')
      .typeError('Stock quantity must be a number'),
    discount: Yup.number()
      .min(0, 'Discount cannot be negative')
      .max(100, 'Discount cannot exceed 100%')
      .typeError('Discount must be a number'),
    brand: Yup.string().trim(),
    weight: Yup.number()
      .min(0, 'Weight cannot be negative')
      .typeError('Weight must be a number'),
    dimensions: Yup.object({
      length: Yup.number()
        .min(0, 'Length cannot be negative')
        .typeError('Length must be a number'),
      width: Yup.number()
        .min(0, 'Width cannot be negative')
        .typeError('Width must be a number'),
      height: Yup.number()
        .min(0, 'Height cannot be negative')
        .typeError('Height must be a number'),
    }),
    isActive: Yup.boolean(),
    specifications: Yup.array().of(
      Yup.object({
        key: Yup.string().trim().required('Specification key is required'),
        value: Yup.string().trim().required('Specification value is required'),
      })
    ),
    tags: Yup.string().trim(),
  });

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await AxiosInstance.get(`/api/products/${id}`);
        const {
          title, description, price, size, color, category, material,
          stockQuantity, discount, brand, weight, dimensions, isActive,
          specifications, tags, images
        } = response.data;
        setFormData({
          title,
          description,
          price: price.toString(),
          size,
          color,
          category,
          material,
          stockQuantity: stockQuantity.toString(),
          discount: discount.toString(),
          brand,
          weight: weight.toString(),
          dimensions,
          isActive,
          specifications: Object.entries(specifications || {}).map(([key, value]) => ({ key, value })),
          tags: tags.join(', '),
        });
        setCurrentImages(images);
        setLoading(false);
      } catch (err) {
        setErrors({ general: 'Failed to fetch product' });
        setLoading(false);
        toast.error('Error fetching product', { position: 'bottom-left' });
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('dimensions.')) {
      const dimensionField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        dimensions: { ...prev.dimensions, [dimensionField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const newValues = checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value);
      return { ...prev, [field]: newValues };
    });
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleImageChange = (e) => {
    const selectedFiles = [...e.target.files].slice(0, 10 - currentImages.length);
    setImages((prev) => [...prev, ...selectedFiles]);
    setErrors((prev) => ({ ...prev, images: '' }));
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeCurrentImage = (index) => {
    setCurrentImages(currentImages.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index, field, value) => {
    setFormData((prev) => {
      const newSpecs = [...prev.specifications];
      newSpecs[index] = { ...newSpecs[index], [field]: value };
      return { ...prev, specifications: newSpecs };
    });
    setErrors((prev) => ({ ...prev, [`specifications[${index}].${field}`]: '' }));
  };

  const addSpecField = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  const removeSpecField = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`specifications[${index}].key`];
      delete newErrors[`specifications[${index}].value`];
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!isAuthenticated) {
      setErrors({ general: 'You must be logged in to update a product' });
      return;
    }

    if (currentImages.length + images.length === 0) {
      setErrors({ images: 'Please select at least one image' });
      return;
    }
    if (currentImages.length + images.length > 10) {
      setErrors({ images: 'Cannot upload more than 10 images' });
      return;
    }

    try {
      // Validate form data
      await validationSchema.validate(formData, { abortEarly: false });

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      formData.size.forEach((size) => data.append('size[]', size));
      formData.color.forEach((color) => data.append('color[]', color));
      data.append('category', formData.category);
      data.append('material', formData.material);
      data.append('stockQuantity', formData.stockQuantity);
      data.append('discount', formData.discount || 0);
      data.append('brand', formData.brand);
      data.append('weight', formData.weight || 0);
      data.append('dimensions', JSON.stringify(formData.dimensions));
      data.append('specifications', JSON.stringify(
        formData.specifications.reduce((acc, spec) => ({ ...acc, [spec.key]: spec.value }), {})
      ));
      data.append('tags', formData.tags);
      data.append('isActive', formData.isActive);
      images.forEach((image) => data.append('images', image));
      currentImages.forEach((image) => data.append('currentImages[]', image));

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
      if (err.name === 'ValidationError') {
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      } else {
        setErrors({ general: err.response?.data?.message || 'Error updating product. Please try again.' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Edit Product</h2>
          <button
            onClick={() => navigate('/manageproduct')}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
          >
            Back to Products
          </button>
        </div>

        {errors.general && (
          <p className="text-red-600 text-center bg-red-100 py-2 px-4 rounded-md mb-6">{errors.general}</p>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Enter product title"
                />
                {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Enter price (e.g., 29.99)"
                />
                {errors.price && <p className="text-red-600 text-xs mt-1">{errors.price}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                rows={4}
                placeholder="Enter product description"
              />
              {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="" disabled>Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-600 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter material (e.g., 100% Cotton)"
              />
              {errors.material && <p className="text-red-600 text-xs mt-1">{errors.material}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Enter stock quantity"
                />
                {errors.stockQuantity && <p className="text-red-600 text-xs mt-1">{errors.stockQuantity}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Enter discount (e.g., 10)"
                />
                {errors.discount && <p className="text-red-600 text-xs mt-1">{errors.discount}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter brand name"
              />
              {errors.brand && <p className="text-red-600 text-xs mt-1">{errors.brand}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (grams)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="0"
                  className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Enter weight"
                />
                {errors.weight && <p className="text-red-600 text-xs mt-1">{errors.weight}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Is Active</label>
                <select
                  name="isActive"
                  value={formData.isActive}
                  onChange={handleChange}
                  className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
                {errors.isActive && <p className="text-red-600 text-xs mt-1">{errors.isActive}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (cm)</label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <input
                    type="number"
                    name="dimensions.length"
                    value={formData.dimensions.length}
                    onChange={handleChange}
                    min="0"
                    className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Length"
                  />
                  {errors['dimensions.length'] && <p className="text-red-600 text-xs mt-1">{errors['dimensions.length']}</p>}
                </div>
                <div>
                  <input
                    type="number"
                    name="dimensions.width"
                    value={formData.dimensions.width}
                    onChange={handleChange}
                    min="0"
                    className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Width"
                  />
                  {errors['dimensions.width'] && <p className="text-red-600 text-xs mt-1">{errors['dimensions.width']}</p>}
                </div>
                <div>
                  <input
                    type="number"
                    name="dimensions.height"
                    value={formData.dimensions.height}
                    onChange={handleChange}
                    min="0"
                    className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Height"
                  />
                  {errors['dimensions.height'] && <p className="text-red-600 text-xs mt-1">{errors['dimensions.height']}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sizes</label>
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
                          ? 'bg-purple-600 text-white border-purple-600 scale-105 shadow-md'
                          : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-purple-50 hover:shadow-lg'}
                      `}
                    >
                      {size}
                    </span>
                  </label>
                ))}
              </div>
              {errors.size && <p className="text-red-600 text-xs mt-1">{errors.size}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Colors</label>
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
                          ? 'border-purple-600 scale-125 shadow-xl ring-2 ring-purple-300'
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
              {errors.color && <p className="text-red-600 text-xs mt-1">{errors.color}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex gap-4 mb-2">
                  <div className="w-1/2">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                      placeholder="Key (e.g., Fabric)"
                      className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    {errors[`specifications[${index}].key`] && (
                      <p className="text-red-600 text-xs mt-1">{errors[`specifications[${index}].key`]}</p>
                    )}
                  </div>
                  <div className="w-1/2">
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      placeholder="Value (e.g., 100% Cotton)"
                      className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    {errors[`specifications[${index}].value`] && (
                      <p className="text-red-600 text-xs mt-1">{errors[`specifications[${index}].value`]}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpecField(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSpecField}
                className="mt-2 text-purple-600 hover:underline"
              >
                Add Specification
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter tags (e.g., casual, graphic-tee)"
              />
              {errors.tags && <p className="text-red-600 text-xs mt-1">{errors.tags}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Images (max 10)</label>
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
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-purple-700 transition"
              >
                {images.length > 0 ? `${images.length} new selected` : 'Choose New Images'}
              </label>
              {errors.images && <p className="text-red-600 text-xs mt-1">{errors.images}</p>}
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
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition"
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
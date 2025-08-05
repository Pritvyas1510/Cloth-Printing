import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from '../../Axios/AxiosInstance';
import { useAuth } from '../../AuthContext/AuthContext';
import * as Yup from 'yup';

const AddProduct = () => {
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
  const [error, setError] = useState('');

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
    const selectedFiles = [...e.target.files].slice(0, 10);
    setImages(selectedFiles);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index, field, value) => {
    setFormData((prev) => {
      const newSpecs = [...prev.specifications];
      newSpecs[index] = { ...newSpecs[index], [field]: value };
      return { ...prev, specifications: newSpecs };
    });
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setError('You must be logged in to create a product');
      return;
    }

    try {
      // Validate form data
      await validationSchema.validate(formData, { abortEarly: false });

      if (images.length === 0) {
        setError('Please select at least one image');
        return;
      }
      if (images.length > 10) {
        setError('Cannot upload more than 10 images');
        return;
      }

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

      const response = await AxiosInstance.post('/api/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Product created successfully!', {
        position: 'bottom-left',
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setFormData({
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
      setImages([]);
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = err.errors.reduce((acc, error) => {
          acc[error.path] = error.message;
          return acc;
        }, {});
        setError(Object.values(errors).join('; '));
      } else {
        setError(
          err.response?.data?.message ||
          'Error creating product. Please try again.'
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Add New Product</h2>
        {error && (
          <p className="text-red-600 text-center bg-red-100 py-2 px-4 rounded-md mb-6">{error}</p>
        )}

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
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (cm)</label>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                name="dimensions.length"
                value={formData.dimensions.length}
                onChange={handleChange}
                min="0"
                className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Length"
              />
              <input
                type="number"
                name="dimensions.width"
                value={formData.dimensions.width}
                onChange={handleChange}
                min="0"
                className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Width"
              />
              <input
                type="number"
                name="dimensions.height"
                value={formData.dimensions.height}
                onChange={handleChange}
                min="0"
                className="w-full text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Height"
              />
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
            {formData.specifications.map((spec, index) => (
              <div key={index} className="flex gap-4 mb-2">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                  placeholder="Key (e.g., Fabric)"
                  className="w-1/2 text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                  placeholder="Value (e.g., 100% Cotton)"
                  className="w-1/2 text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images (max 10)</label>
            <input
              type="file"
              name="images"
              id="images"
              onChange={handleImageChange}
              multiple
              required
              accept="image/*"
              className="hidden"
            />
            <label
              htmlFor="images"
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-purple-700 transition"
            >
              {images.length > 0 ? `${images.length} selected` : 'Choose Images'}
            </label>
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index}`}
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
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition"
          >
            Create Product
          </button>
        </form>
        <ToastContainer position="bottom-left" />
      </div>
    </div>
  );
};

export default AddProduct;
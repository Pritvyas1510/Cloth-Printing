import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../../Axios/AxiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DesignIntro from './DesignIntro';
import DesignSteps from './DesignSteps';
import DesignCTA from './DesignCTA';

const Design = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await AxiosInstance.get('/api/products');
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
        toast.error('Error fetching products', { position: 'top-left' });
      }
    };
    fetchProducts();
  }, []);

  const handleSelectProduct = (product) => {
    navigate(`/productdetails/${product._id}`);
  };

  return (
    <div className="min-h-screen bg-blue-100  px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="fixed top-4 left-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md w-80 z-50">
            {error}
          </div>
        )}

        <DesignIntro
          products={products}
          loading={loading}
          onSelectProduct={handleSelectProduct}
        />

        {selectedProduct && (
          <DesignSteps
            selectedProduct={selectedProduct}
          />
        )}

        <DesignCTA />

        <ToastContainer position="top-left" autoClose={3000} />
      </div>
    </div>
  );
};

export default Design;
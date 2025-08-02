import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ListOrdered, PackageSearch } from 'lucide-react';

const Adminhome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-10 text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Create Product Card */}
        <Link
          to="/addproduct"
          className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border hover:border-blue-400"
        >
          <PlusCircle className="text-blue-600" size={50} />
          <h2 className="text-xl text-cyan-950 font-semibold mt-4">Create Product</h2>
          <p className="text-gray-600 mt-2">Add new products to your store easily.</p>
        </Link>

        {/* Manage Products Card */}
        <Link
          to="/manageproduct"
          className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border hover:border-blue-400"
        >
          <ListOrdered className="text-green-600" size={50} />
          <h2 className="text-xl text-cyan-950 font-semibold mt-4">Manage Products</h2>
          <p className="text-gray-600 mt-2">View, update, or delete existing products.</p>
        </Link>
      </div>

      {/* All Products Section */}
      <Link
        to="/allproduct"
        className="mt-12 bg-white p-8 w-full max-w-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border hover:border-indigo-400"
      >
        <PackageSearch className="text-indigo-600" size={45} />
        <h2 className="text-xl text-cyan-950 font-semibold mt-3">All Products</h2>
        <p className="text-gray-600 mt-2">Browse the full product inventory.</p>
      </Link>
    </div>
  );
};

export default Adminhome;

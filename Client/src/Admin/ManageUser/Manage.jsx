import React from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Clock, PackageSearch, Truck, CheckCircle2, XCircle } from "lucide-react";

const Manage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-10 text-gray-800">Manage Orders</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* All Orders */}
        <Link
          to="/allorder"
          className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border hover:border-purple-400"
        >
          <ClipboardList className="text-purple-600" size={50} />
          <h2 className="text-xl text-cyan-950 font-semibold mt-4">All Orders</h2>
          <p className="text-gray-600 mt-2">View all orders placed by users.</p>
        </Link>

        {/* Pending Orders */}
        <Link
          to="/admin/orders/pending"
          className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border hover:border-yellow-400"
        >
          <Clock className="text-yellow-600" size={50} />
          <h2 className="text-xl text-cyan-950 font-semibold mt-4">Pending Orders</h2>
          <p className="text-gray-600 mt-2">Orders waiting for processing.</p>
        </Link>

        {/* Processing Orders */}
        <Link
          to="/admin/orders/processing"
          className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border hover:border-blue-400"
        >
          <PackageSearch className="text-blue-600" size={50} />
          <h2 className="text-xl text-cyan-950 font-semibold mt-4">Processing Orders</h2>
          <p className="text-gray-600 mt-2">Orders currently being designed or printed.</p>
        </Link>

        {/* Shipped Orders */}
        <Link
          to="/admin/orders/shipped"
          className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border hover:border-green-400"
        >
          <Truck className="text-green-600" size={50} />
          <h2 className="text-xl text-cyan-950 font-semibold mt-4">Shipped Orders</h2>
          <p className="text-gray-600 mt-2">Orders that have been dispatched.</p>
        </Link>

        {/* Completed Orders */}
        <Link
          to="/admin/orders/completed"
          className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border hover:border-indigo-400"
        >
          <CheckCircle2 className="text-indigo-600" size={50} />
          <h2 className="text-xl text-cyan-950 font-semibold mt-4">Completed Orders</h2>
          <p className="text-gray-600 mt-2">Delivered orders with feedback.</p>
        </Link>

        {/* Cancelled Orders */}
        <Link
          to="/admin/orders/cancelled"
          className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border hover:border-red-400"
        >
          <XCircle className="text-red-600" size={50} />
          <h2 className="text-xl text-cyan-950 font-semibold mt-4">Cancelled Orders</h2>
          <p className="text-gray-600 mt-2">Orders cancelled by user or admin.</p>
        </Link>
      </div>
    </div>
  );
};

export default Manage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const response = await handleRegister(formData, navigate);
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="h-auto bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-4 py-4">
      <div className="bg-white rounded-2xl mt-5 shadow-lg overflow-hidden w-full max-w-6xl transform transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-col md:flex-row w-full">
          {/* Left Decorative Section */}
          <div className="hidden md:block w-full md:w-1/2 bg-gradient-to-br from-purple-600 to-indigo-700">
            <div className="h-full flex items-center justify-center p-6 text-white">
              <div className="text-center">
                <h2 className="text-2xl font-extrabold mb-2">Join Us</h2>
                <p className="text-sm leading-snug">
                  Create your account and start your journey with Stitch Design today!
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="w-full md:w-1/2 p-4 sm:p-4 lg:p-6 bg-white">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-3">Sign Up</h2>
            <p className="text-xs text-gray-600 text-center mb-4">
              Please fill in the details to create your account
            </p>

            <form onSubmit={submitHandler} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full text-gray-900 px-3 py-1.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition duration-200"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full text-gray-900 px-3 py-1.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition duration-200"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full text-gray-900 px-3 py-1.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition duration-200"
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-black hover:text-gray-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="mobile" className="block text-gray-700 text-sm font-medium mb-1">
                  Mobile
                </label>
                <input
                  id="mobile"
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  className="w-full text-gray-900 px-3 py-1.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition duration-200"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-gray-700 text-sm font-medium mb-1">
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full text-gray-900 px-3 py-1.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition duration-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition duration-300 ease-in-out"
              >
                Sign Up
              </button>
            </form>

            <p className="text-xs text-gray-600 text-center mt-3">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-purple-600 hover:underline font-medium transition duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
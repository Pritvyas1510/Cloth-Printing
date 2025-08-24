import React from "react";
import { motion } from "framer-motion";

const Notfound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-900">
      {/* Animated 404 */}
      <motion.h1
        className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 drop-shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        404
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="mt-4 text-2xl md:text-3xl font-semibold text-gray-700"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Oops! Page Not Found 🚫
      </motion.p>

      {/* Small description */}
      <motion.p
        className="mt-2 text-lg text-gray-600 max-w-md text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        The page you’re looking for doesn’t exist or has been moved.
      </motion.p>
    </div>
  );
};

export default Notfound;

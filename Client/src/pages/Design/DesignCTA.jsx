import React from 'react';

const DesignCTA = () => {
  return (
    <section className="bg-indigo-500 py-16 rounded-3xl text-white text-center">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-semibold mb-4">Ready to Create?</h3>
        <p className="mb-6 text-[#e7edf4]">Jump into our design studio and bring your idea to life.</p>
        <a
        
          className="inline-block bg-white text-[#0d141c] px-6 py-3 rounded font-medium hover:bg-gray-100 transition"
        >
          Launch Designer
        </a>
      </div>
    </section>
  );
};

export default DesignCTA;
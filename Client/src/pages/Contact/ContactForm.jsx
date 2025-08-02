import React from 'react';

const ContactForm = () => {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <form className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Name</label>
            <input type="text" className="w-full border border-gray-300 rounded px-4 py-2" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input type="email" className="w-full border border-gray-300 rounded px-4 py-2" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Message</label>
            <textarea className="w-full border border-gray-300 rounded px-4 py-2 h-32" placeholder="Type your message here..."></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;
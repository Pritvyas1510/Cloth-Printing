import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      title: { type: String, required: true },
      color: { type: String },
      size: { type: String },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      designDescription: { type: String },
      customDesign: { type: String },
      deliveredImage: { type: String },
      deliveredImageStatus: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
      rating: { type: Number, min: 1, max: 5 },
    },
  ],
  totalAmount: { type: Number, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'done'], default: 'pending' },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', orderSchema);
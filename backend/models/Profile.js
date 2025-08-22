import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  gender: { type: String },
  dob: { type: Date },
  profileImage: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('UserProfile', profileSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["client", "freelancer", "admin"], default: "client" },
  city: { type: String },
  phone: { type: String },
  cnicImageUrl: { type: String },
  isVerified: { type: Boolean, default: false },
  walletBalance: { type: Number, default: 5000 },
  bio: { type: String },
  skills: [{ type: String }],
  avgRating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

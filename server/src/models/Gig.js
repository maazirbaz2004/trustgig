const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  city: { type: String, required: true },
  deliveryDays: { type: Number, required: true },
  images: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Gig', gigSchema);

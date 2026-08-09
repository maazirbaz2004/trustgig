const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['funded', 'delivered', 'completed', 'disputed', 'refunded'], default: 'funded' },
  deliveryNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

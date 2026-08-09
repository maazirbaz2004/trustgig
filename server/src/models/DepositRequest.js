const mongoose = require('mongoose');

const depositRequestSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  receiptUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
  adminNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DepositRequest', depositRequestSchema);

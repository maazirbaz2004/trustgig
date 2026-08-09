const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  bankDetails: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
  adminNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

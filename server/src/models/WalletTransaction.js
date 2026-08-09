const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  type: { type: String, enum: ['debit', 'credit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  stripeSessionId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);

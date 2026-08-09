const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

const fundEscrow = async (client, amount, bookingId) => {
  // For MVP testing, if the client doesn't have enough balance, automatically fund their wallet
  if (client.walletBalance < amount) {
    client.walletBalance += (amount + 10000); 
  }

  client.walletBalance -= amount;
  await client.save();

  await WalletTransaction.create({
    user: client._id,
    booking: bookingId,
    type: 'debit',
    amount,
    description: 'Funded escrow for booking'
  });
};

const releaseEscrow = async (freelancerId, amount, bookingId) => {
  const freelancer = await User.findById(freelancerId);
  freelancer.walletBalance += amount;
  await freelancer.save();

  await WalletTransaction.create({
    user: freelancer._id,
    booking: bookingId,
    type: 'credit',
    amount,
    description: 'Escrow released for completed booking'
  });
};

const refundEscrow = async (clientId, amount, bookingId) => {
  const client = await User.findById(clientId);
  client.walletBalance += amount;
  await client.save();

  await WalletTransaction.create({
    user: client._id,
    booking: bookingId,
    type: 'credit',
    amount,
    description: 'Escrow refunded for cancelled/disputed booking'
  });
};

module.exports = { fundEscrow, releaseEscrow, refundEscrow };

const User = require('../models/User');
const Dispute = require('../models/Dispute');
const Booking = require('../models/Booking');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const { releaseEscrow, refundEscrow } = require('../services/escrowService');

const getPendingVerifications = async (req, res) => {
  const users = await User.find({ cnicImageUrl: { $ne: null }, isVerified: false })
                          .select('-passwordHash');
  res.json(users);
};

const verifyUser = async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.isVerified = true;
  await user.save();

  res.json({ message: 'User verified successfully', user: { id: user._id, name: user.name, isVerified: user.isVerified } });
};

const rejectUser = async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.cnicImageUrl = null; // Clear it so they have to re-upload
  await user.save();

  res.json({ message: 'User KYC rejected' });
};

const getOpenDisputes = async (req, res) => {
  const disputes = await Dispute.find({ status: 'open' }).populate({
    path: 'booking',
    populate: { path: 'client freelancer gig' }
  });
  res.json(disputes);
};

const resolveDispute = async (req, res) => {
  const { action, resolutionNotes } = req.body; // action: 'release' or 'refund'
  const dispute = await Dispute.findById(req.params.id);
  
  if (!dispute) {
    return res.status(404).json({ message: 'Dispute not found' });
  }

  if (dispute.status !== 'open') {
    return res.status(400).json({ message: 'Dispute is already resolved' });
  }

  const booking = await Booking.findById(dispute.booking);

  if (action === 'release') {
    await releaseEscrow(booking.freelancer, booking.amount, booking._id);
    booking.status = 'completed';
  } else if (action === 'refund') {
    await refundEscrow(booking.client, booking.amount, booking._id);
    booking.status = 'refunded';
  } else {
    return res.status(400).json({ message: 'Invalid action. Use "release" or "refund"' });
  }

  await booking.save();

  dispute.status = 'resolved';
  dispute.resolutionNotes = resolutionNotes;
  await dispute.save();

  res.json({ message: `Dispute resolved and funds ${action}ed` });
};

const getPendingWithdrawals = async (req, res) => {
  const requests = await WithdrawalRequest.find({ status: 'pending' }).populate('freelancer', 'name email phone');
  res.json(requests);
};

const processWithdrawal = async (req, res) => {
  const request = await WithdrawalRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Withdrawal request not found' });

  if (request.status !== 'pending') {
    return res.status(400).json({ message: 'Withdrawal is already processed' });
  }

  request.status = 'completed';
  await request.save();

  res.json({ message: 'Withdrawal marked as completed' });
};

const getPendingDeposits = async (req, res) => {
  const DepositRequest = require('../models/DepositRequest');
  const requests = await DepositRequest.find({ status: 'pending' }).populate('client', 'name email phone');
  res.json(requests);
};

const approveDeposit = async (req, res) => {
  const DepositRequest = require('../models/DepositRequest');
  const WalletTransaction = require('../models/WalletTransaction');
  
  const request = await DepositRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Deposit request not found' });

  if (request.status !== 'pending') {
    return res.status(400).json({ message: 'Deposit is already processed' });
  }

  const user = await User.findById(request.client);
  user.walletBalance += request.amount;
  await user.save();

  await WalletTransaction.create({
    user: user._id,
    type: 'credit',
    amount: request.amount,
    description: 'Manual Wallet Deposit'
  });

  request.status = 'completed';
  await request.save();

  res.json({ message: 'Deposit approved and funds credited' });
};

module.exports = { 
  getPendingVerifications, verifyUser, rejectUser, 
  getOpenDisputes, resolveDispute,
  getPendingWithdrawals, processWithdrawal,
  getPendingDeposits, approveDeposit
};

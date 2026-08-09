const Stripe = require('stripe');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const DepositRequest = require('../models/DepositRequest');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const getTransactions = async (req, res) => {
  const transactions = await WalletTransaction.find({ user: req.user.id }).sort({ createdAt: -1 });
  const withdrawalRequests = await WithdrawalRequest.find({ freelancer: req.user.id }).sort({ createdAt: -1 });
  
  res.json({
    balance: req.user.walletBalance, // assuming req.user comes from auth middleware, we should fetch fresh user
    transactions,
    withdrawalRequests
  });
};

const getBalanceAndHistory = async (req, res) => {
  const user = await User.findById(req.user.id);
  const transactions = await WalletTransaction.find({ user: req.user.id }).sort({ createdAt: -1 });
  const withdrawalRequests = await WithdrawalRequest.find({ freelancer: req.user.id }).sort({ createdAt: -1 });
  
  res.json({
    balance: user.walletBalance,
    transactions,
    withdrawalRequests
  });
};

const requestDeposit = async (req, res) => {
  const { amount, receiptUrl } = req.body;

  if (!amount || amount < 500) {
    return res.status(400).json({ message: 'Minimum deposit is Rs. 500' });
  }

  if (!receiptUrl) {
    return res.status(400).json({ message: 'Receipt upload is required' });
  }

  const request = await DepositRequest.create({
    client: req.user.id,
    amount,
    receiptUrl
  });

  res.status(201).json({ message: 'Deposit request submitted for verification', request });
};

const requestWithdrawal = async (req, res) => {
  const { amount, bankDetails } = req.body;

  if (!amount || amount < 1000) {
    return res.status(400).json({ message: 'Minimum withdrawal is Rs. 1000' });
  }

  if (!bankDetails) {
    return res.status(400).json({ message: 'Bank details are required' });
  }

  const user = await User.findById(req.user.id);
  if (user.walletBalance < amount) {
    return res.status(400).json({ message: 'Insufficient wallet balance' });
  }

  // Deduct from wallet immediately to prevent double spending
  user.walletBalance -= amount;
  await user.save();

  await WalletTransaction.create({
    user: user._id,
    type: 'debit',
    amount: amount,
    description: 'Withdrawal Request'
  });

  const request = await WithdrawalRequest.create({
    freelancer: user._id,
    amount,
    bankDetails
  });

  res.status(201).json({ message: 'Withdrawal request submitted', request });
};

module.exports = { getBalanceAndHistory, requestDeposit, requestWithdrawal };

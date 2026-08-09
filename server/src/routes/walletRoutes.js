const express = require('express');
const router = express.Router();
const { getBalanceAndHistory, requestDeposit, requestWithdrawal } = require('../controllers/walletController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

router.get('/', protect, getBalanceAndHistory);
router.post('/deposit', protect, requireRole('client'), requestDeposit);
router.post('/withdraw', protect, requireRole('freelancer'), requestWithdrawal);

module.exports = router;

const express = require('express');
const router = express.Router();
const { 
  getPendingVerifications, verifyUser, rejectUser,
  getOpenDisputes, resolveDispute,
  getPendingWithdrawals, processWithdrawal,
  getPendingDeposits, approveDeposit
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

router.use(protect);
router.use(requireRole('admin'));

router.get('/pending-verifications', getPendingVerifications);
router.put('/verify/:userId', verifyUser);
router.put('/reject/:userId', rejectUser);

router.get('/disputes', getOpenDisputes);
router.put('/disputes/:id/resolve', resolveDispute);

router.get('/withdrawals', getPendingWithdrawals);
router.put('/withdrawals/:id/complete', processWithdrawal);

router.get('/deposits', getPendingDeposits);
router.put('/deposits/:id/approve', approveDeposit);

module.exports = router;

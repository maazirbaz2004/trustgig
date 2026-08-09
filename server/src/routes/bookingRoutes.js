const express = require('express');
const router = express.Router();
const { createBooking, deliverBooking, approveBooking, getMyBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

router.get('/', protect, getMyBookings);
router.post('/', protect, requireRole('client'), createBooking);
router.put('/:id/deliver', protect, requireRole('freelancer'), deliverBooking);
router.put('/:id/approve', protect, requireRole('client'), approveBooking);

module.exports = router;

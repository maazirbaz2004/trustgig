const express = require('express');
const router = express.Router();
const { createGig, getGigs, getGigById, updateGig, deleteGig } = require('../controllers/gigController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

router.route('/')
  .get(getGigs)
  .post(protect, requireRole('freelancer', 'admin'), createGig);

router.route('/:id')
  .get(getGigById)
  .put(protect, requireRole('freelancer', 'admin'), updateGig)
  .delete(protect, requireRole('freelancer', 'admin'), deleteGig);

module.exports = router;

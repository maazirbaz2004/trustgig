const express = require('express');
const router = express.Router();
const { createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

router.post('/', protect, requireRole('client'), createReview);

module.exports = router;

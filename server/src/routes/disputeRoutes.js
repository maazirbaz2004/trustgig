const express = require('express');
const router = express.Router();
const { createDispute } = require('../controllers/disputeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('evidence'), createDispute);

module.exports = router;

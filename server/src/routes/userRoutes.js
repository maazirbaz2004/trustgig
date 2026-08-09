const express = require('express');
const router = express.Router();
const { getMe, uploadCnic } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/me', protect, getMe);
router.post('/cnic', protect, uploadCnic);

module.exports = router;

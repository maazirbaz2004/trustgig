const express = require('express');
const router = express.Router();
const { getConversations, getMessagesWithUser, getUnreadCount } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/:userId', getMessagesWithUser);

module.exports = router;

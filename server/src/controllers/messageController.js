const Message = require('../models/Message');
const User = require('../models/User');

const getConversations = async (req, res) => {
  // Find all unique users this user has messaged or received messages from
  const messages = await Message.find({
    $or: [{ sender: req.user.id }, { receiver: req.user.id }]
  }).sort({ createdAt: -1 });

  const usersMap = new Map();

  for (let msg of messages) {
    const otherUserId = msg.sender.toString() === req.user.id ? msg.receiver.toString() : msg.sender.toString();
    
    if (!usersMap.has(otherUserId)) {
      usersMap.set(otherUserId, {
        lastMessage: msg,
      });
    }
  }

  const conversations = [];
  for (let [userId, data] of usersMap.entries()) {
    const user = await User.findById(userId).select('name email role');
    if (user) {
      conversations.push({ user, lastMessage: data.lastMessage });
    }
  }

  res.json(conversations);
};

const getMessagesWithUser = async (req, res) => {
  const otherUserId = req.params.userId;
  
  const messages = await Message.find({
    $or: [
      { sender: req.user.id, receiver: otherUserId },
      { sender: otherUserId, receiver: req.user.id }
    ]
  }).sort({ createdAt: 1 }); // Oldest to newest

  res.json(messages);
};

const getUnreadCount = async (req, res) => {
  const count = await Message.countDocuments({
    receiver: req.user.id,
    isRead: false
  });
  res.json({ count });
};

module.exports = { getConversations, getMessagesWithUser, getUnreadCount };

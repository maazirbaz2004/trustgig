const Message = require('./models/Message');

const setupSocket = (io) => {
  // Simple map to keep track of connected users: userId -> socketId
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // When a user logs in and opens the app, they send their userId
    socket.on('register', (userId) => {
      connectedUsers.set(userId, socket.id);
      console.log('User registered for chat:', userId);
    });

    // When a user sends a message
    socket.on('send_message', async (data) => {
      const { senderId, receiverId, content } = data;

      try {
        // Save to DB
        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content
        });
        
        // Fully populate sender so the receiver gets name/avatar if needed
        const populatedMsg = await Message.findById(message._id).populate('sender', 'name').populate('receiver', 'name');

        // Send to receiver if they are online
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', populatedMsg);
        }

        // Also echo back to the sender so their UI updates
        socket.emit('message_sent', populatedMsg);

      } catch (err) {
        console.error('Socket error sending message:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Remove from connected users
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
    });
  });
};

module.exports = setupSocket;

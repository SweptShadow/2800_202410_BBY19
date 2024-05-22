const { Server } = require('socket.io');
const sharedSession = require('express-socket.io-session');
const Message = require('./models/message');
const User = require('./models/user');

function initializeSocket(server, sessionMiddleware) {
  const io = new Server(server);

  io.use(sharedSession(sessionMiddleware, {
    autoSave: true
  }));

  io.on('connection', (socket) => {
    console.log(`User ${socket.id} connected`);

    if (!socket.handshake.session.userId) {
      console.error('No user ID in session. Disconnecting socket.');
      socket.disconnect();
      return;
    }

    socket.on('joinChatRoom', async (friendId) => {
      const userId = socket.handshake.session.userId;

      try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
          console.error('User or friend not found.');
          return;
        }

        // Ensure a consistent room ID
        const roomId = [userId.toString(), friendId.toString()].sort().join('_');
        socket.join(roomId);
        socket.emit('setChatRoomId', roomId);
        console.log(`User joined chat room: ${roomId}`);

        const messages = await Message.find({ chatRoomId: roomId }).sort({ timestamp: 1 }).populate('senderId', 'username');
        const messagesWithUsernames = messages.map(msg => ({
          chatRoomId: msg.chatRoomId,
          senderId: msg.senderId._id,
          username: msg.senderId.username,
          message: msg.message,
          timestamp: msg.timestamp,
        }));

        socket.emit('chatHistory', messagesWithUsernames);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    });

    socket.on('chat message', async (msg) => {
      const userId = socket.handshake.session.userId;

      const newMessage = new Message({
        chatRoomId: msg.chatRoomId,
        senderId: userId,
        message: msg.message,
        timestamp: new Date(),
      });

      try {
        const savedMessage = await newMessage.save();
        const populatedMessage = await Message.findById(savedMessage._id).populate('senderId', 'username').exec();
        io.to(msg.chatRoomId).emit('chat message', {
          chatRoomId: populatedMessage.chatRoomId,
          senderId: populatedMessage.senderId._id,
          username: populatedMessage.senderId.username,
          message: populatedMessage.message,
          timestamp: populatedMessage.timestamp,
        });
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = initializeSocket;

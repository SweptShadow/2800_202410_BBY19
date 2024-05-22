const { Server } = require('socket.io');
const sharedSession = require('express-socket.io-session');
const Message = require('./models/message');
const User = require('./models/user');

/**
 * Starts the socket.io server.
 * 
 * Sets up the socket.io server and then integrates it with the shared session.
 * Defines some event handlers for socket events like connecting to the server,
 * joining a room and sending messages.
 * @param {Object} server http server instance
 * @param {Object} sessionMiddleware middleware to share session data between clients
 * @returns {Server} socket.io server instance
  */
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

    /**
     * Event handler for joining a chat room.
     * 
     * Validates the session, gets the user and friend information from the db and then either joins or 
     * creates a room based on the IDs. Loads the chat history for the users.
     */
    socket.on('joinChatRoom', async (friendId) => {
      const userId = socket.handshake.session.userId;

      try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
          console.error('User or friend not found.');
          return;
        }

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

    /**
     * When a user sends a message it is saved to the database and broadcast to all users in the 
     * same room. 
     */
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

    socket.on('joinVideoCallRoom', (roomId, userId) => {
      socket.join(roomId);
      console.log(`User ${userId} joined video call room: ${roomId}`);
      socket.to(roomId).emit("user-connected", userId);

      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected from video call room: ${roomId}`);
        socket.to(roomId).emit("user-disconnected", userId);
      });
    });
  });

  return io;
}

module.exports = initializeSocket;

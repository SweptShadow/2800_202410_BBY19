const { Server } = require('socket.io');
const sharedSession = require("express-socket.io-session");
const Message = require('./models/message');

function initializeSocket(server, sessionMiddleware) {
  const io = new Server(server);

  io.use(sharedSession(sessionMiddleware, {
    autoSave: true
  }));

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinChatRoom', async (roomId) => {
      socket.join(roomId);
      console.log(`User joined chat room: ${roomId}`);

      try {
        const messages = await Message.find({ chatRoomId: roomId }).sort({ timestamp: 1 });
        const messagesWithUsernames = messages.map(msg => ({
          ...msg.toObject(),
          username: msg.senderId 
        }));
        socket.emit('chatHistory', messagesWithUsernames);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }

      socket.on("chat message", async (msg) => {
        console.log("Server received message: ", msg);
        const newMessage = new Message({
          chatRoomId: roomId,
          senderId: socket.handshake.session.userId,
          message: msg.message,
          timestamp: new Date(),
        });
        try {
          await newMessage.save();
          io.to(roomId).emit("chat message", {
            chatRoomId: newMessage.chatRoomId,
            senderId: newMessage.senderId,
            username: socket.handshake.session.username,
            message: newMessage.message,
            timestamp: newMessage.timestamp,
          });
        } catch (error) {
          console.error('Error saving message:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected from chat room: ${roomId}`);
      });
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

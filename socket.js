const { Server } = require('socket.io');
const sharedSession = require("express-socket.io-session");
const Message = require('./models/message');
const ChatRoom = require('./models/chatRoom');

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

    socket.on('joinChatRoom', async (roomName) => {
      if (!roomName || roomName.trim() === '') {
        console.error('Room name is required to join a chat room.');
        return;
      }
      roomName = roomName.trim();

      try {
        console.log(`User joining chat room: ${roomName}`);
        let room = await ChatRoom.findOne({ name: roomName });
        if (!room) {
          console.log(`Creating new chat room: ${roomName}`);
          room = new ChatRoom({ name: roomName, createdAt: new Date() });
          await room.save();
        }
        socket.join(room._id.toString());
        console.log(`User joined chat room: ${room.name}`);

        socket.emit("setChatRoomId", room._id.toString());

        const messages = await Message.find({ chatRoomId: room._id }).sort({ timestamp: 1 }).populate('senderId', 'username');
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

    socket.on("chat message", async (msg) => {
      if (!msg.chatRoomId || !msg.message) {
        console.error('chatRoomId and message are required to send a message.');
        return;
      }
      const newMessage = new Message({
        chatRoomId: msg.chatRoomId,
        senderId: socket.handshake.session.userId,
        message: msg.message,
        timestamp: new Date(),
      });

      try {
        const savedMessage = await newMessage.save();
        const populatedMessage = await Message.findById(savedMessage._id).populate('senderId', 'username').exec();
        io.to(msg.chatRoomId).emit("chat message", {
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
      console.log(`User disconnected from chat room: ${socket.rooms}`);
    });
  });

  

  return io;
}

module.exports = initializeSocket;

const { Server } = require('socket.io');
const sharedSession = require("express-socket.io-session");

function initializeSocket(server, sessionMiddleware) {
  const io = new Server(server);

  io.use(sharedSession(sessionMiddleware, {
    autoSave: true
  }));

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinChatRoom', (roomId) => {
      socket.join(roomId);
      console.log(`User joined chat room: ${roomId}`);

      socket.on("chat message", (msg) => {
        console.log("Server received message: ", msg);
        io.to(roomId).emit("chat message", msg);
        console.log("message: " + msg.message);
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



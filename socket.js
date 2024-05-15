// socket.js
const { Server } = require('socket.io');
const sharedSession = require("express-socket.io-session");

function initializeSocket(server, sessionMiddleware) {
  const io = new Server(server);

  io.use(sharedSession(sessionMiddleware, {
    autoSave: true
  }));

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on("chat message", (msg) => {
      io.to(msg.chatRoomId).emit("chat message", msg);
      console.log("message: " + msg.message);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  return io;
}

module.exports = initializeSocket;

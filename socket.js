const { Server } = require('socket.io');
const sharedSession = require("express-socket.io-session");

function initializeSocket(server, sessionMiddleware) {
  const io = new Server(server);

  io.use(sharedSession(sessionMiddleware, {
    autoSave: true
  }));

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on("chat message", (msg) => {
      io.emit("chat message", msg);
      console.log("message: " + msg);
    });
  });

  return io;
}

module.exports = initializeSocket;
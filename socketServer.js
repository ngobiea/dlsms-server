const authSocket = require('./middlewares/authSocket');

const registerSocketServer = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  io.use((socket, next) => {
    console.log('before auth');

    authSocket(socket, next);
    console.log('after auth');
  });

  io.on('connection', (socket) => {
    console.log('user connected');
    console.log(socket.id);

    // newConnectionHandler(socket, io);
    // emitOnlineUsers();

    socket.on('disconnect', () => {
      //   disconnectHandler(socket);
      console.log('User Disconnected');
    });
  });
};

module.exports = {
  registerSocketServer,
};

const authSocket = require('./middlewares/authSocket');
const serverStore = require('./serverStore');
const newConnectionHandler = require('./socketHandlers/newConnectionHandler');
const disconnectHandler = require('./socketHandlers/disconnectHandler');
const {
  handleGetClassroom,
} = require('./socketHandlers/updates/updateClassroom');
const registerSocketServer = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  serverStore.setSocketServerInstance(io);

  io.use((socket, next) => {
    authSocket(socket, next);
  });

  const emitOnlineUsers = () => {
    const onlineUsers = serverStore.getOnlineUsers();
    io.emit('online-users', { onlineUsers });
  };

  io.on('connection', (socket) => {
    console.log('user connected');
    console.log(socket.id);

    newConnectionHandler(socket, io);
    emitOnlineUsers();

    socket.on('disconnect', () => {
      console.log('User Disconnected');
      disconnectHandler(socket);
    });

    socket.on('update-classroom', (classroomId) => {
      console.log('update classroom events received from client');
      handleGetClassroom(classroomId,socket);
    });
  });
};

module.exports = {
  registerSocketServer,
};


const serverStore = require("../serverStore");

const newConnectionHandler = async (socket, io) => {
  const userDetails = socket.userId;
  serverStore.addNewConnectedUser({
    socketId: socket.id,
    userId: userDetails,
  });


};

module.exports = newConnectionHandler;

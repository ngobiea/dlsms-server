import {addNewConnectedUser} from '../serverStore.js';

const newConnectionHandler = async (socket, io) => {
  const userDetails = socket.userId;
  addNewConnectedUser({
    socketId: socket.id,
    userId: userDetails,
  });
};

export default newConnectionHandler;

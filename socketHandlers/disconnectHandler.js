import { removeConnectedUser } from '../serverStore.js';

const disconnectHandler = (socket) => {
  removeConnectedUser(socket.id);
};

export default disconnectHandler;

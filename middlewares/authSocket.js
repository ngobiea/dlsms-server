import jsonwebtoken from 'jsonwebtoken';
import User from '../model/User.js';
const authSocket = async (socket, next) => {
  const token = socket.handshake.auth?.token;
  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    const user = await User.findById(
      userId,
      '-verified -password -machineLearningImages -__v'
    );

    socket.userId = user._id.toString();
    socket.user = user;
   
  } catch (e) {
    const err = new Error('not authorized');
    err.data = { content: 'Please retry later' };
    next(err);
  }

  next();
};

export default authSocket;

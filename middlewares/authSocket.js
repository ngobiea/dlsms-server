import jsonwebtoken from 'jsonwebtoken';



const verifyTokenSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;
  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    const { accountType, userId } = decoded;
    socket.accountType = accountType;
    socket.userId = userId;
  } catch (e) {
    const err = new Error('not authorized');
    err.data = { content: 'Please retry later' }; // additional details
    next(err);
  }

  next();
};

export default verifyTokenSocket;

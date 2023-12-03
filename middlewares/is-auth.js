import jsonwebtoken from 'jsonwebtoken';
import User from '../model/User.js';
export default async (req, _res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jsonwebtoken.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId.toString();

  const user = await User.findById(
    decodedToken.userId.toString(),
    '-verified -password -machineLearningImages -__v'
  );

  req.role = user.role;
  next();
};

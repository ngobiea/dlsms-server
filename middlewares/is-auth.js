import jwt from 'jsonwebtoken';
import User from '../model/User.js';

const authenticateUser = async (req, _res, next) => {
  try {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      const error = new Error('Token not found.');
      error.statusCode = 401;
      throw error;
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      err.statusCode = 401;
      throw err;
    }

    if (!decodedToken || !decodedToken.userId) {
      const error = new Error('Invalid token.');
      error.statusCode = 401;
      throw error;
    }

    req.userId = decodedToken.userId.toString();

    const user = await User.findById(
      decodedToken.userId.toString(),
      '-verified -password -machineLearningImages -__v'
    );

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 401;
      throw error;
    }

    req.role = user.role;
    next();
  } catch (err) {
    next(err); // Pass any encountered error to the Express error handler
  }
};

export default authenticateUser;

import jsonwebtoken from 'jsonwebtoken';
import User from '../../../model/User.js';
import { statusCode } from '../../../util/statusCodes.js';

export const verifyEmail = async (req, res, next) => {
  const { token } = req.params;
  try {
    const decodedToken = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    const { userId } = decodedToken;

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    user.verified = true;
    await user.save();
    res.redirect('/success');
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

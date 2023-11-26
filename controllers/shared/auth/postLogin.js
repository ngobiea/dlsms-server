import { validationResult } from 'express-validator';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import { statusCode } from '../../../util/statusCodes.js';
import User from '../../../model/User.js';

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.UNPROCESSABLE_ENTITY;
      error.data = errors.array();
      throw error;
    }
    const { email, password, accountType } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error(
        'Email not found click Create Account to register'
      );
      error.statusCode = statusCode.UNAUTHORIZED;
      throw error;
    }
    if (user.role !== accountType) {
      const error = new Error('Unauthorized! Invalid account type');
      error.statusCode = statusCode.UNAUTHORIZED;
      throw error;
    }

    const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!passwordMatch) {
      const error = new Error('Invalid password');
      error.statusCode = statusCode.UNAUTHORIZED;
      throw error;
    }
    if (!user.verified) {
      const error = new Error('Please verify your email first.');
      error.statusCode = statusCode.UNAUTHORIZED;
      error.type = 'verify';
      throw error;
    }
    const token = jsonwebtoken.sign(
      {
        email,
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION_TIME }
    );
    res.status(statusCode.OK).json({
      userDetails: {
        userId: user._id.toString(),
        accountType: user.role,
        token,
        email,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(err);
  }
};

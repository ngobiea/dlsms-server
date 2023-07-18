const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tutor = require('../../../model/tutorModel');
const Student = require('../../../model/studentModel');
const { statusCode } = require('../../../util/util');

exports.login = async (req, res, next) => {
  let user;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.UNPROCESSABLE_ENTITY;
      error.data = errors.array();
      throw error;
    }
    const { email, password, accountType } = req.body;

    if (accountType === 'tutor') {
      user = await Tutor.findOne({ email });
    } else if (accountType === 'student') {
      user = await Student.findOne({ email });
    }
    if (!user) {
      const error = new Error(
        'Email not found click Create Account to register'
      );
      error.statusCode = statusCode.UNAUTHORIZED;
      throw error;
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
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

    const token = jwt.sign(
      {
        email,
        accountType,
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION_TIME }
    );
    res.status(statusCode.OK).json({
      userDetails: {
        userId: user._id.toString(),
        token,
        email,
      },
      accountType,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(err);
  }
};

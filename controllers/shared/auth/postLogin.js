const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tutor = require('../../../model/tutorModel');
const Student = require('../../../model/studentModel');

exports.login = async (req, res, next) => {
  let user;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 422;
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
      const error = new Error('Email not found click signup to register');
      error.statusCode = 401;
      throw error;
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      const error = new Error('Invalid password');
      error.statusCode = 401;
      throw error;
    }
    if (!user.verified) {
      const error = new Error('Please verify your email first.');
      error.statusCode = 401;
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
    res.status(200).json({
      userDetails: {
        userId: user._id.toString(),
        token,
        email,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const aws = require('../../../util/aws/ses');
const emailMessages = require('../../../util/emailMessages');
const User = require('../../../model/userModel');
const { statusCode } = require('../../../util/statusCodes');
exports.signup = async (req, res, next) => {
  let newUser;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.UNPROCESSABLE_ENTITY;
      error.data = errors.array();
      throw error;
    }
    const { firstName, lastName, institution, accountType, email, password } =
      req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error(
        'A user with this email already exists. Login or choose another email'
      );
      error.statusCode = statusCode.CONFLICT;
      error.type = 'email';
      throw error;
    }
    const hashedPassword = await bcrypt.hash(
      password,
      parseFloat(process.env.SALT)
    );
    newUser = new User({
      firstName,
      lastName,
      institution,
      email,
      password: hashedPassword,
      verified: false,
      role: accountType,
      studentId: accountType === 'student' ? req.body.studentId : ' ',
    });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    });
    const verificationLink = `http://localhost:${process.env.PORT}/verify-email/${token}`;

    try {
      aws.sendEmail(
        email,
        'Verify Your Email to Join Us!',
        emailMessages.signUpEmail(firstName, verificationLink)
      );
    } catch (error) {
      const err = new Error('Failed to send verification email');
      err.statusCode = 500;
      throw err;
    }

    res
      .status(statusCode.CREATED)
      .json({ message: `New ${accountType} created` });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(err);
  }
};

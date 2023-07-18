const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tutor = require('../../../model/tutorModel');
const Student = require('../../../model/studentModel');
const aws = require('../../../util/aws');
const emailMessages = require('../../../util/emailMessages');
const { statusCode } = require('../../../util/util');
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
    const existingTutor = await Tutor.findOne({ email });
    const existingStudent = await Student.findOne({ email });

    if (existingTutor) {
      const error = new Error(
        'A user with this email already exist. Login or choose another email'
      );
      error.statusCode = statusCode.CONFLICT;
      error.type = 'email';
      throw error;
    } else if (existingStudent) {
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

    if (accountType === 'tutor') {
      newUser = new Tutor({
        firstName,
        lastName,
        institution,
        email,
        password: hashedPassword,
        verified: false,
      });
      await newUser.save();
    } else if (accountType === 'student') {
      const { studentId } = req.body;
      newUser = new Student({
        firstName,
        lastName,
        studentId,
        institution,
        email,
        password: hashedPassword,
        verified: false,
      });
      await newUser.save();
    }
    const token = jwt.sign(
      { userId: newUser._id, accountType },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      }
    );
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

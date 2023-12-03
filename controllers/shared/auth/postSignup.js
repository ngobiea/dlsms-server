import { validationResult } from 'express-validator';

import { sendEmail } from '../../../util/aws/ses.js';
import { signUpEmail } from '../../../util/emailMessages.js';
import bcrypt from 'bcryptjs';

import jsonwebtoken from 'jsonwebtoken';
import User from '../../../model/User.js';
import { statusCode } from '../../../util/statusCodes.js';

const handleError = (error, next) => {
  if (!error.statusCode) {
    error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
  }
  next(error);
};

export const signup = async (req, res, next) => {
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
      parseInt(process.env.SALT, 10)
    );
    const newUser = new User({
      firstName,
      lastName,
      institution,
      email,
      password: hashedPassword,
      verified: false,
      role: accountType,
      studentId: accountType === 'student' ? req.body.studentId : ' ',
    });

    // Attempt to save the new user
    await newUser.save();

    const token = jsonwebtoken.sign(
      { userId: newUser._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      }
    );

    const verificationLink = `${req.protocol}://${req.get(
      'host'
    )}/verify-email/${token}`;

    try {
      // Attempt to send the email
      await sendEmail(
        email,
        'Verify Your Email to Join Us!',
        signUpEmail(firstName, verificationLink)
      );
      res
        .status(statusCode.CREATED)
        .json({ message: `New ${accountType} created`, email });
    } catch (error) {
      // If sending email fails, delete the user
      await User.deleteOne({ _id: newUser._id }); // Delete the user from the database
      throw new Error('Failed to send verification email');
    }
  } catch (error) {
    handleError(error, next);
  }
};

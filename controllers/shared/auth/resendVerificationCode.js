const jwt = require('jsonwebtoken');
const Student = require('../../../model/studentModel');
const aws = require('../../../util/aws');
const Tutor = require('../../../model/tutorModel');
const emailMessages = require('../../../util/emailMessages');
const { statusCode } = require('../../../util/util');

exports.resendVerificationCode = async (req, res, next) => {
  const { email } = req.body;
  try {
    const existingTutor = await Tutor.findOne({ email });
    const existingStudent = await Student.findOne({ email });

    if (!existingTutor && !existingStudent) {
      // If no tutor or student exists with the given email, return 404 Not Found status
      const error = new Error('No user found with this email');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    // Get the user (either tutor or student) based on the email
    const user = existingTutor || existingStudent;

    // Generate new JWT with user information
    const token = jwt.sign(
      { userId: user._id, accountType: existingTutor ? 'tutor' : 'student' },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      }
    );

    const verificationLink = `http://localhost:8080/verify-email/${token}`;
    try {
      aws.sendEmail(
        email,
        'Verify Your Email to Join Us!',
        emailMessages.signUpEmail(user.firstName, verificationLink)
      );
    } catch (error) {
      const err = new Error('Failed to send verification email');
      err.statusCode = statusCode.INTERNAL_SERVER_ERROR;
      throw err;
    }

    res.status(statusCode.OK).json({ message: 'Verification email sent successfully' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(err);
  }
};

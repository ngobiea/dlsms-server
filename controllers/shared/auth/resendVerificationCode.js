import jsonwebtoken from 'jsonwebtoken';
import { sendEmail } from '../../../util/aws/ses.js';
import User from '../../../model/userModel.js';
import { signUpEmail } from '../../../util/emailMessages.js';
import { statusCode } from '../../../util/statusCodes.js';

export const  resendVerificationCode = async (req, res, next)=> {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('No user found with this email');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const token = jsonwebtoken.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      }
    );
    const verificationLink = `http://localhost:${process.env.PORT}/verify-email/${token}`;
    try {
      sendEmail(
        email,
        'Verify Your Email to Join Us!',
        signUpEmail(user.firstName, verificationLink)
      );
    } catch (error) {
      const err = new Error('Failed to send verification email');
      err.statusCode = statusCode.INTERNAL_SERVER_ERROR;
      throw err;
    }
    res
      .status(statusCode.OK)
      .json({ message: 'Verification email sent successfully' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(err);
  }
}


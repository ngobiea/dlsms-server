const jwt = require('jsonwebtoken');
const Student = require('../../../model/studentModel');
const Tutor = require('../../../model/tutorModel');

exports.verifyEmail = async (req, res, next) => {
  const { token } = req.params;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { accountType, userId } = decodedToken;

    if (accountType === 'tutor') {
      const tutor = await Tutor.findById(userId);
      if (!tutor) {
        const error = new Error('Tutor not found');
        error.statusCode = 404;
        throw error;
      }
      tutor.verified = true;
      await tutor.save();
    } else if (accountType === 'student') {
      const student = await Student.findById(userId);
      if (!student) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
      }
      student.verified = true;
      await student.save();
    } else {
      const error = new Error('Invalid accountType');
      error.statusCode = 400;
      throw error;
    }
    res.status(200).json({ message: 'Email verified' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

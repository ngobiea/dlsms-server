const Classroom = require('../../../model/classroom');
const { validationResult } = require('express-validator');
const { statusCode } = require('../../../util/statusCodes');
exports.verifyClassroomCode = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.BAD_REQUEST;
      error.data = errors.array();
      throw error;
    }
    const { code } = req.body;
    const classroomId = await Classroom.findOne({ code }, { _id: 1 });
    if (!classroomId) {
      const error = new Error('Invalid classroom code');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    res.status(statusCode.OK).json({
      message: 'Classroom code verification pass',
      classroomId,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(err);
  }
};

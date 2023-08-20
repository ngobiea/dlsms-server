const { validationResult } = require('express-validator');
const Classroom = require('../../../model/classroom');
const {
  generateClassroomCode,
} = require('../../../util/generateClassroomCode');
const { statusCode } = require('../../../util/statusCodes');
exports.createClassroom = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const { name, description } = req.body;

    const classroom = new Classroom({
      name,
      description,
      code: generateClassroomCode(),
      tutor: req.userId,
    });

    await classroom.save();

    res.status(statusCode.CREATED).json({
      message: 'Classroom created successfully',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const { validationResult } = require('express-validator');
const Classroom = require('../../../model/classroom');
const {
  generateClassroomCode,
} = require('../../../util/generateClassroomCode');
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
      tutorId: req.userId,
    });
    const newClassroom = await classroom.save();
    res.status(201).json({
      message: 'Classroom created successfully',
      classroom: newClassroom,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

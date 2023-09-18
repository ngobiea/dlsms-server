import { validationResult } from 'express-validator';
import Classroom from '../../../model/Classroom.js';
import { generateClassroomCode } from '../../../util/generateClassroomCode.js';
import { statusCode } from '../../../util/statusCodes.js';
export const createClassroom = async (req, res, next) => {
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

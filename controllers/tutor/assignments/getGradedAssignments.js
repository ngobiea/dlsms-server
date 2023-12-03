import Assignment from '../../../model/Assignment.js';
import { statusCode } from '../../../util/statusCodes.js';
import { validationResult } from 'express-validator';

export const getGradedAssignments = async (req, res, next) => {
  try {
    const { classroomId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.BAD_REQUEST;
      error.data = errors.array();
      throw error;
    }
    const assignments = await Assignment.find(
      {
        classroom: classroomId,
        status: 'graded',
      },
      'title dueDate points'
    );
    res.status(statusCode.OK).json(assignments);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

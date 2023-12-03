import Assignment from '../../../model/Assignment.js';
import { statusCode } from '../../../util/statusCodes.js';
import { validationResult } from 'express-validator';

export const getAssignedAssignments = async (req, res, next) => {
  try {
    const { classroomId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.BAD_REQUEST;
      error.data = errors.array();
      throw error;
    }
    let assignments = [];
    if (req.role === 'tutor') {
      assignments = await Assignment.find(
        {
          classroom: classroomId,
          status: 'assigned',
        },
        'title dueDate points'
      );
    } else if (req.role === 'student') {
      assignments = await Assignment.find(
        {
          classroom: classroomId,
          submissions: { $not: { $elemMatch: { student: req.userId } } },
        },
        'title dueDate points'
      );
    }
    res.status(statusCode.OK).json(assignments);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

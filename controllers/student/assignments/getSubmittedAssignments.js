import { statusCode } from '../../../util/statusCodes.js';
import Assignment from '../../../model/Assignment.js';
import { validationResult } from 'express-validator';

export const getSubmittedAssignments = async (req, res, next) => {
  try {
    const { classroomId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.BAD_REQUEST;
      error.data = errors.array();
      throw error;
    }
    const submissions = await Assignment.find({
      classroom: classroomId,
      'submissions.student': req.userId,
    });
    res.status(statusCode.OK).json(submissions);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

import Assignment from '../../../model/Assignment.js';
import { statusCode } from '../../../util/statusCodes.js';
import { validationResult } from 'express-validator';

export const getAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.BAD_REQUEST;
      error.data = errors.array();
      throw error;
    }
    const foundAssignment = await Assignment.findById(assignmentId).populate({
      path: 'submissions',
      populate: {
        path: 'student',
        select: 'firstName lastName studentId',
      },
    });
    if (!foundAssignment) {
      const error = new Error('Assignment not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }

    if (req.role === 'tutor') {
      const submission = [...foundAssignment.submissions];
      res.status(statusCode.OK).json(submission);
    } else if (req.role === 'student') {
      const assignment = {
        title: foundAssignment.title,
        dueDate: foundAssignment.dueDate,
        points: foundAssignment.points,
        instruction: foundAssignment.instruction,
        files: foundAssignment.files,
        submissions: foundAssignment.submissions.filter((submission) => {
          return submission.student._id.toString() === req.userId.toString();
        }),
      };
      res.status(statusCode.OK).json(assignment);
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

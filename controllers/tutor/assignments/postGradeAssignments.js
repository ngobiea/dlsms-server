import Assignment from '../../../model/Assignment.js';
import { statusCode } from '../../../util/statusCodes.js';
import { validationResult } from 'express-validator';

export const postGradeAssignment = async (req, res, next) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.BAD_REQUEST;
      error.data = errors.array();
      throw error;
    }

    const { assignmentId, submissionId, points } = req.body;
    const foundAssignment = await Assignment.findById(assignmentId);
    if (!foundAssignment) {
      const error = new Error('Assignment not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }

    const foundSubmission = foundAssignment.submissions.find((submission) => {
      return submission._id.toString() === submissionId.toString();
    });

    if (!foundSubmission) {
      const error = new Error('Submission not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }

    foundSubmission.points = points;
    foundSubmission.graded = true;

    await foundAssignment.save();

    res.status(statusCode.OK).json({
      message: 'Assignment graded successfully',
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

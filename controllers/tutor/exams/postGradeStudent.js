import StudentExamSession from '../../../model/StudentExamSession.js';
import { statusCode } from '../../../util/statusCodes.js';
import { validationResult } from 'express-validator';

export const postGradeStudentExamSession = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.BAD_REQUEST;
      error.data = errors.array();
      throw error;
    }
    const { examSessionId, points } = req.body;
    const studentExamSession = await StudentExamSession.findById(examSessionId);
    if (!studentExamSession) {
      const error = new Error('Student exam session not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    studentExamSession.points = points;
    await studentExamSession.save();
    res.status(statusCode.OK).json({ message: 'success' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

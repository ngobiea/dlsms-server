import StudentExamSession from '../../../model/StudentExamSession.js';
import { statusCode } from '../../../util/statusCodes.js';
import { validationResult } from 'express-validator';

export const getStudentAnswers = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.BAD_REQUEST;
      error.data = errors.array();
      throw error;
    }
    const { studentExamSessionId } = req.params;
    const studentExamSession = await StudentExamSession.findById(
      studentExamSessionId
    )
      .populate('examSession')
      .populate('student', 'firstName lastName studentId');

    if (!studentExamSession) {
      const error = new Error('Student exam session not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }

    res.status(statusCode.OK).json({
      firstName: studentExamSession.student.firstName,
      lastName: studentExamSession.student.lastName,
      answers: studentExamSession.answers,
      browserHistory: studentExamSession.browsingHistory.length,
      violations: studentExamSession.violations.length,
      startTime: studentExamSession.startTime,
      endTime: studentExamSession.endTime,
      points: studentExamSession.points,
      examSessionTitle: studentExamSession.examSession.title,
      totalPoint: studentExamSession.examSession.examQuestions.reduce(
        (total, question) => total + question.points,
        0
      ),
      studentId: studentExamSession.student.studentId,
      _id: studentExamSession._id,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

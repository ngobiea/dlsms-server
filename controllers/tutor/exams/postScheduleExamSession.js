import Classroom from '../../../model/Classroom.js';
import ExamSession from '../../../model/ExamSession.js';
import { validationResult } from 'express-validator';
import { statusCode } from '../../../util/statusCodes.js';

export const scheduleExamSession = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.UNPROCESSABLE_ENTITY;
      error.data = errors.array();
      throw error;
    }
    const { title, description, startDate, endDate, classroomId } = req.body;
    // find classroom if exist
    const classroom = await Classroom.findById(classroomId).populate(
      'tutor',
      '-password -verified -email -institution -_id'
    );
    if (!classroom) {
      const error = new Error('Classroom not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    // create exam session
    const examSession = new ExamSession({
      title,
      description,
      startDate,
      endDate,
      classroomId,
      tutor: req.userId,
    });
    // save exam session
    await examSession.save();
    res.status(statusCode.CREATED).json({
      examSessionId: examSession._id.toString(),
      message: 'Exam session created successfully',
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

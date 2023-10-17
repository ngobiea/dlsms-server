import Classroom from '../../../model/Classroom.js';
import { validationResult } from 'express-validator';
import { statusCode } from '../../../util/statusCodes.js';
export const verifyClassroomCode = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.BAD_REQUEST;
      error.data = errors.array();
      throw error;
    }
    const { code } = req.body;
    const classroomId = await Classroom.findOne(
      { code },
      { _id: 1, students: 1 }
    );
    if (!classroomId) {
      const error = new Error('Invalid classroom code');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const studentInClassroom = classroomId.students.find(
      (studentId) => studentId.toString() === req.userId.toString()
    );
    let studentAlreadyJoined = false;
    if (studentInClassroom) {
      studentAlreadyJoined = true;
      console.log('student already joined classroom');
    }
    res.status(statusCode.OK).json({
      classroomId,
      status: studentAlreadyJoined,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(err);
  }
};

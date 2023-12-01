<<<<<<< HEAD
import StudentExamSession from '../../../model/StudentExamSession.js';
import { statusCode } from '../../../util/statusCodes.js';

export const getStudentExamSession = async (req, res) => {
  try {
    const { examSessionId } = req.params;
    const studentExamSession = await StudentExamSession.find(
      { examSession: examSessionId },
      'student startTime endTime violations browsingHistory _id points answers'
    )
      .populate({
        path: 'student',
        select: 'firstName lastName studentId',
      })
      .populate('examSession', 'totalPoint');

    const students = studentExamSession.map((student) => {
      return {
        firstName: student.student.firstName,
        lastName: student.student.lastName,
        studentId: student.student.studentId,
        violations: student.violations.length + student.browsingHistory.length,
        startTime: student.startTime,
        endTime: student.endTime,
        _id: student._id,
        totalPoint: student.examSession.totalPoint,
        points: student.points,
      };
    });
    res.status(statusCode.OK).json(students);
  } catch (error) {
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error',
    });
  }
};
=======
import StudentExamSession from '../../../model/StudentExamSession.js';
import { statusCode } from '../../../util/statusCodes.js';

export const getStudentExamSession = async (req, res) => {
  try {
    const { examSessionId } = req.params;
    const studentExamSession = await StudentExamSession.find(
      { examSession: examSessionId },
      'student startTime endTime violations browsingHistory _id'
    ).populate({
      path: 'student',
      select: 'firstName lastName studentId',
    });
    const students = studentExamSession.map((student) => {
      return {
        firstName: student.student.firstName,
        lastName: student.student.lastName,
        studentId: student.student.studentId,
        violations: student.violations.length + student.browsingHistory.length,
        startTime: student.startTime,
        endTime: student.endTime,
        _id: student._id,
      };
    });
    res.status(statusCode.OK).json(students);
  } catch (error) {
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error',
    });
  }
};
>>>>>>> e23f8c2e82f3ef458a99065a0f7e8b9e0a7ccfd0

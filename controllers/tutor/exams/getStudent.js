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

<<<<<<< HEAD
import StudentClassSession from '../../../model/StudentClassSession.js';
import { statusCode } from '../../../util/statusCodes.js';
import { calculateAttendance } from '../../../util/dateDifference.js';
export const getStudentClassSession = async (req, res) => {
  try {
    const { classSessionId } = req.params;
    const studentClassSession = await StudentClassSession.find(
      { classSession: classSessionId },
      'student startTime endTime verify _id'
    )
      .populate({
        path: 'student',
        select: 'firstName lastName studentId',
      })
      .populate({
        path: 'classSession',
        select: 'startDate endDate',
      });
    const data = studentClassSession.map((student) => {
      return {
        _id: student._id,
        studentId: student.student.studentId,
        name: `${student.student.firstName} ${student.student.lastName}`,
        startTime: student.startTime[0],
        endTime: student.endTime[student.endTime.length - 1],
        attendance: calculateAttendance(
          student.classSession.startDate,
          student.classSession.endDate,
          student.verify
        ),
        left: student.endTime.length - 1,
      };
    });
    res.status(statusCode.OK).json(data);
  } catch (error) {
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error',
    });
  }
};

=======
import StudentClassSession from '../../../model/StudentClassSession.js';
import { statusCode } from '../../../util/statusCodes.js';

export const getStudentClassSession = async (req, res) => {
  try {
    const { classSessionId } = req.params;
    const studentClassSession = await StudentClassSession.find(
      { classSession: classSessionId },
      'student startTime endTime verify _id'
    ).populate({
      path: 'student',
      select: 'firstName lastName studentId',
    });
    res.status(statusCode.OK).json(studentClassSession);
  } catch (error) {
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error',
    });
  }
};
>>>>>>> e23f8c2e82f3ef458a99065a0f7e8b9e0a7ccfd0

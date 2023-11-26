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

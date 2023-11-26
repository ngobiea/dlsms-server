import ExamSession from '../../../model/ExamSession.js';
import { statusCode } from '../../../util/statusCodes.js';

export const getExamSessions = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const examSession = await ExamSession.find(
      { classroomId },
      'title startDate endDate _id'
    ).populate({
      path: 'students',
      select: 'name _id',
      populate: {
        path: 'student',
        select: '_id firstName lastName studentId',
      },
    });
    res.status(statusCode.OK).json(examSession);
  } catch (error) {
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error',
    });
  }
};

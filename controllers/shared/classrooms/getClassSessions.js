import ClassSession from '../../../model/ClassSession.js';
import { statusCode } from '../../../util/statusCodes.js';

export const getClassSessions = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const classSession = await ClassSession.find(
      { classroomId },
      'title startDate endDate _id students'
    );

    res.status(statusCode.OK).json(classSession);
  } catch (error) {
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error',
    });
  }
};


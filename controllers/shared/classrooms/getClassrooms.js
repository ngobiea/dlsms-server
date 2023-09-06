import Classroom from '../../../model/classroom.js';
import { statusCode } from '../../../util/statusCodes.js';

export const getClassrooms = async (req, res, next) => {
  try {
    const { userId } = req;
    const classrooms = await Classroom.find(
      {
        $or: [{ tutor: userId }, { students: userId }],
      },
      'name _id'
    );
    res.status(statusCode.OK).json({
      message: 'Classrooms fetched successfully',
      classrooms,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(err);
  }
};

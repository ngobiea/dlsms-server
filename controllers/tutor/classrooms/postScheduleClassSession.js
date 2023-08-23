import Classroom from '../../../model/classroom';
import ClassSession from '../../../model/classSession';
import Message from '../../../model/message';
import { validationResult } from 'express-validator';
import { statusCode } from '../../../util/statusCodes';
import { handleScheduleClassSession } from '../../../socketHandlers/tutors/handleScheduleClassSession';

export async function scheduleClassSession(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation Failed');
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
    // create class session
    const classSession = new ClassSession({
      title,
      description,
      startDate,
      endDate,
      classroomId,
      tutor: req.userId,
    });

    // save class session
    const savedClassSession = await classSession.save();
    // create message
    const message = new Message({
      classroomId,
      sender: req.userId,
      text: `Class session ${title} has been scheduled`,
      type: 'classSession',
      classSession: savedClassSession,
    });
    // save message
    const savedMessage = await message.save();
    const savedSessionMessage = {
      message: {
        _id: savedMessage._id,
        sender: {
          _id: req.userId,
          firstName: classroom.tutor.firstName,
          lastName: classroom.tutor.lastName,
        },
        text: description,
        type: message.type,
        classSession: {
          _id: savedClassSession._id.toString(),
          title,
          description,
          startDate,
        },
        timestamp: message.timestamp,
      },
      classroomId,
    };
    handleScheduleClassSession(savedSessionMessage);
    // send response
    res.status(statusCode.CREATED).json({
      savedSessionMessage,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(err);
  }
}

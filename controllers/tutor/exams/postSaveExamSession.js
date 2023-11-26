import ExamSession from '../../../model/ExamSession.js';
import { statusCode } from '../../../util/statusCodes.js';
import Message from '../../../model/Message.js';
import Classroom from '../../../model/Classroom.js';
import { handleScheduleExamSession } from '../../../socketHandlers/tutors/handleScheduleExamSession.js';
import { getScheduleTime } from '../../../util/time/getScheduleTime.js';

export const postSaveExamSession = async (req, res, next) => {
  const { examSessionId } = req.body;

  try {
    const examSession = await ExamSession.findById(examSessionId);
    if (!examSession) {
      const error = new Error('Exam session not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const classroom = await Classroom.findById(
      examSession.classroomId
    ).populate('tutor', '-password -verified -email -institution -_id');

    const message = new Message({
      classroomId: classroom._id,
      sender: req.userId,
      text: `Exam session ${examSession.title} has been scheduled`,
      type: 'examSession',
      examSession,
    });
    const timeUntilTarget = getScheduleTime(examSession.startDate);

    setTimeout(async () => {
      const savedMessage = await message.save();
      const savedSessionMessage = {
        message: {
          _id: savedMessage._id.toString(),
          sender: {
            _id: req.userId,
            firstName: classroom.tutor.firstName,
            lastName: classroom.tutor.lastName,
          },
          text: examSession.description,
          type: message.type,
          examSession: {
            _id: examSession._id.toString(),
            title: examSession.title,
            description: examSession.description,
            startDate: examSession.startDate,
            endDate: examSession.endDate,
          },
          timestamp: savedMessage.timestamp,
        },
        classroomId: classroom._id.toString(),
      };
      handleScheduleExamSession(savedSessionMessage);
    }, timeUntilTarget);
    res.status(statusCode.CREATED).json({
      message: 'Exam session scheduled',
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

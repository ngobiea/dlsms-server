import Classroom from '../../../model/Classroom.js';
import ExamSession from '../../../model/ExamSession.js';
import { validationResult } from 'express-validator';
import { statusCode } from '../../../util/statusCodes.js';

export const scheduleExamSession = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
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
    // create exam session
    const examSession = new ExamSession({
      title,
      description,
      startDate,
      endDate,
      classroomId,
      tutor: req.userId,
    });
    // save exam session
    await examSession.save();
    res
      .status(statusCode.CREATED)
      .json({
        examSessionId: examSession._id.toString(),
        message: 'Exam session created successfully',
      });
    // // create message
    // const message = new Message({
    //   classroomId,
    //   sender: req.userId,
    //   text: `Exam session ${title} has been scheduled`,
    //   type: 'examSession',
    //   examSession: savedExamSession,
    // });
    // // save message
    // const savedMessage = await message.save();
    // const savedSessionMessage = {
    //   message: {
    //     _id: savedMessage._id,
    //     sender: {
    //       _id: req.userId,
    //       firstName: classroom.tutor.firstName,
    //       lastName: classroom.tutor.lastName,
    //     },
    //     text: description,
    //     type: message.type,
    //     examSession: {
    //       _id: savedExamSession._id,
    //       title: savedExamSession.title,
    //       description: savedExamSession.description,
    //       startDate: savedExamSession.startDate,
    //       endDate: savedExamSession.endDate,
    //       tutor: savedExamSession.tutor,
    //       classroomId: savedExamSession.classroomId,
    //     },
    //   },
    // };
    // // send message to classroom
    // req.io.to(classroomId).emit('newMessage', savedSessionMessage);
    // res.status(statusCode.CREATED).json({
    //   message: 'Exam session created successfully',
    // });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

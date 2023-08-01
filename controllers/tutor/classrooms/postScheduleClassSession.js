const Classroom = require('../../../model/classroom');
const ClassSession = require('../../../model/classSession');
const Message = require('../../../model/message');
const { validationResult } = require('express-validator');
const { statusCode } = require('../../../util/statusCodes');
exports.scheduleClassSession = async (req, res, next) => {
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
      'tutorId',
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
      tutorId: req.userId,
    });

    // save class session
    const savedClassSession = await classSession.save();
    // create message
    const message = new Message({
      classroomId,
      sender: {
        tutor: req.userId,
      },
      text: `Class session ${title} has been scheduled`,
      type: 'classSession',
      classSession: savedClassSession,
    });
    // save message
    const savedMessage = await message.save();
    // send response
    res.status(statusCode.CREATED).json({
      savedSessionMessage: {
        _id: savedMessage._id,
        userId: req.userId,
        tutorName:
          `${classroom.tutorId.firstName} ${classroom.tutorId.lastName}`,
        time: savedMessage.timestamp,
        type: message.type,
        title,
        startDate,
        description,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(err);
  }
};

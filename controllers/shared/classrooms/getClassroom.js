const Classroom = require('../../../model/classroom');
const Messages = require('../../../model/message');
const { statusCode } = require('../../../util/statusCodes');
const exclude = '-password -verified -email -institution';
exports.getClassroom = async (req, res, next) => {
  try {
    const { classroomId } = req.params;
    const classroom = await Classroom.findById(classroomId)
      .populate('tutorId', exclude)
      .populate(
        'students',
        '-password -verified -institution -machineLearningImages -studentId'
      );
    if (!classroom) {
      const error = new Error('Classroom not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const messages = await Messages.find({ classroomId })
      .populate('sender.tutor', exclude)
      .populate(
        'sender.student',
        '-password -verified -email -institution -_id'
      )
      .populate('classSession', '-tutorId -classroomId -students')
      .populate('examSession', '-tutorId -classroomId -students')
      .populate('poll', '-tutorId -classroomId -students')
      .sort({ timestamp: -1 });
    

    res.status(statusCode.OK).json({
      message: 'Classrooms fetched successfully',
      classroom: {
        _id: classroom._id,
        name: classroom.name,
        description: classroom.description,
        code: classroom.code,
        tutorId: classroom.tutorId,
        students: classroom.students,
        messages
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

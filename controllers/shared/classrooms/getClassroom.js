const Classroom = require('../../../model/classroom');
const Messages = require('../../../model/message');
const { statusCode } = require('../../../util/statusCodes');
exports.getClassroom = async (req, res, next) => {
  try {
    const { classroomId } = req.params;
    const classroom = await Classroom.findById(classroomId)
      .populate(
        'tutor',
        '-password -verified -email -institution -role -studentId -machineLearningImages'
      )
      .populate(
        'students',
        '-password -verified -institution -studentId -role -machineLearningImages -email'
      );
    if (!classroom) {
      const error = new Error('Classroom not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const messages = await Messages.find({ classroomId }, '-classroomId -__v')
      .populate(
        'sender',
        '-password -verified -email -institution -studentId -role'
      )
      .populate('classSession', '-tutor -classroomId -students -endDate')
      .populate('examSession', '-tutor -classroomId -students')
      .populate('poll', '-tutor -classroomId -students')
      .sort({ timestamp: -1 });

    res.status(statusCode.OK).json({
      message: 'Classrooms fetched successfully',
      classroom: {
        _id: classroom._id,
        name: classroom.name,
        description: classroom.description,
        code: classroom.code,
        tutor: classroom.tutor,
        students: classroom.students,
        messages,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

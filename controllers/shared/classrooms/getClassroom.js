const Classroom = require('../../../model/classroom');

exports.getClassroom = async (req, res, next) => {
  try {
    let classroom;
    const { accountType } = req;
    const { classroomId } = req.params;
    if (accountType === 'tutor') {
      classroom = await Classroom.findById(classroomId);
    }
    res.status(200).json({
      message: 'Classrooms fetched successfully',
      classroom,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

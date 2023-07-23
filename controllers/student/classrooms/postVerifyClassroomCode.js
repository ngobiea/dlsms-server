const Classroom = require('../../../model/classroom');

exports.verifyClassroomCode = async (req, res, next) => {
  try {
    console.log(req.body);
    const { code } = req.body;
    const classroomId = await Classroom.findOne({ code }, { _id: 1 });
    if (!classroomId) {
      const error = new Error('Invalid classroom code');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'Classroom fetched successfully',
      classroomId,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

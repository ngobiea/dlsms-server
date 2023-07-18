const Classroom = require('../../../model/classroom');
const Student = require('../../../model/studentModel');
exports.getClassrooms = async (req, res, next) => {
  try {
    let classrooms;
    const { accountType, userId } = req;
    console.log(accountType);
    if (accountType === 'tutor') {
      classrooms = await Classroom.find({ tutorId: userId }, 'name');
    } else if (accountType === 'student') {
      const student = await Student.findById(userId, 'classrooms').populate(
        'classrooms'
      );
      classrooms = student.classrooms
    }
    res.status(200).json({
      classrooms,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

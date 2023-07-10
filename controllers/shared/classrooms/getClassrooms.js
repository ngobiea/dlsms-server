const Classroom = require('../../../model/classroom');

exports.getClassrooms = async (req, res, next) => {
  try {
    let classrooms;
    const { accountType,userId } = req;
    console.log(accountType);
    if (accountType === 'tutor') {
      classrooms = await Classroom.find({ tutorId: userId }, 'name');
    }

    res.status(200).json({
      message: 'Classrooms fetched successfully',
      classrooms,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

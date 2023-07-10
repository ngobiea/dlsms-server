const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tutor = require('../../model/tutorModel');
const aws = require('../../util/aws');
const Classroom = require('../../model/classroom');
const Student = require('../../model/studentModel');
const emailMessages = require('../../util/emailMessages');



exports.getClassrooms = async (req, res, next) => {
  try {
    const classrooms = await Classroom.find({ students: req.studentId })
      .populate('tutorId', 'firstName lastName email')
      .select('name description code tutorId students');
    res.status(200).json({
      message: 'Joined classrooms fetched successfully',
      classrooms,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.getClassroom = async (req, res, next) => {
  try {
    const { code } = req.params;

    const classroomId = await Classroom.findOne({ code }, { _id: 1 });
    if (!classroomId) {
      const error = new Error('Classroom not found');
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

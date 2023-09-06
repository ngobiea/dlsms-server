import User from '../../../model/userModel.js';
import Classroom from '../../../model/classroom.js';
import { statusCode } from '../../../util/statusCodes.js';
import { validationResult } from 'express-validator';
import { handleValidationErrors } from '../../../util/validation.js';
import { updateClassroomMembers } from '../../../socketHandlers/updates/updateClassroomMembers.js';

export const postJoin = async (req, res, next) => {
  const { userId } = req;
  handleValidationErrors(req, res, async () => {
    try {
      const { classroomId } = req.body;
      // check if user is a student
      const student = await User.findById(userId);
      if (!student) {
        const error = new Error('User not found');
        error.statusCode = statusCode.NOT_FOUND;
        throw error;
      }
      if (student.role !== 'student') {
        const error = new Error('User is not a student');
        error.statusCode = statusCode.BAD_REQUEST;
        throw error;
      }
      // check if classroom exists
      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        const error = new Error('Classroom not found');
        error.statusCode = statusCode.NOT_FOUND;
        throw error;
      }
      // check if student already joined the classroom
      const isJoined = classroom.students.find(
        (studentId) => studentId.toString() === student._id.toString()
      );
      if (isJoined) {
        res.status(statusCode.OK).json({ message: 'success' });
      } else {
        // add student to classroom
        classroom.students.push(student);
        await classroom.save();
        const joinedClassroom = {
          _id: classroom._id,
          name: classroom.name,
        };
        joinedClassroom.name = classroom.name;
        updateClassroomMembers(joinedClassroom, classroom.students, userId);
        res.status(statusCode.OK).json({ message: 'success' });
      }
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = statusCode.INTERNAL_SERVER_ERROR;
      }
      next(err);
    }
  });
};

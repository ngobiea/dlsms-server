import { upload } from '../../../middlewares/multer-s3.js';
import User from '../../../model/User.js';
import Classroom from '../../../model/ClassSession.js';
import { statusCode } from '../../../util/statusCodes.js';
import { handleValidationErrors } from '../../../util/validation.js';
import { updateClassroomMembers } from '../../../socketHandlers/updates/updateClassroomMembers.js';
export const postJoinClassroom = async (req, res, next) => {
  const { userId } = req;
  upload(process.env.TRAINING_BUCKET, userId).array('files')(
    req,
    res,
    async (err) => {
      if (err) {
        next(err);
      }
      handleValidationErrors(req, res, async () => {
        try {
          const { files } = req;
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
          // add files to MachineLearningImage

          files.forEach((file) => {
            student.machineLearningImages.push({
              location: file.location,
              bucketName: process.env.TRAINING_BUCKET,
              size: file.size,
              mimetype: file.mimetype,
            });
          });

          // check if student already joined the classroom
          const isJoined = classroom.students.find(
            (studentId) => studentId.toString() === student._id.toString()
          );
          if (isJoined) {
            await student.save();
            res.status(statusCode.OK).json({ message: 'success' });
          } else {
            // add student to classroom
            classroom.students.push(student);
            await student.save();
            await classroom.save();
            // update classroom members
            updateClassroomMembers(classroom, student);
            res
              .status(statusCode.CREATED)
              .json({ message: 'success', students: classroom.students });
          }
        } catch (error) {
          if (!error.statusCode) {
            error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
          }
          next(error);
        }
      });
    }
  );
};

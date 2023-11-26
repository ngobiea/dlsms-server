import { upload } from '../../../middlewares/multer-s3.js';
import User from '../../../model/User.js';
import Classroom from '../../../model/Classroom.js';
import { statusCode } from '../../../util/statusCodes.js';
import { handleValidationErrors } from '../../../util/validation.js';
import { updateClassroomMembers } from '../../../socketHandlers/updates/updateClassroomMembers.js';
import { AWS } from '../../../util/aws/AWS.js';
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
          console.log(files);
          const { classroomId } = req.body;
          // check if user is a student
          const student = await User.findById(
            userId,
            '-password -verified -institution -email'
          );
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
          console.log(classroom);
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
          const isJoined = classroom.students.find(
            (studentId) => studentId.toString() === req.userId
          );
          if (isJoined) {
            await Promise.all(
              files.map((file) =>
                AWS.deleteS3Object(process.env.TRAINING_BUCKET, file.key)
              )
            );
            res.status(statusCode.CONFLICT).json({
              message: 'Student already joined classroom',
            });
          } else {
            // add student to classroom

            classroom.students.push(student._id);
            await classroom.save();
            await student.save();
            const data = {
              classroom: {
                _id: classroom._id.toString(),
                name: classroom.name,
              },
              student: {
                firstName: student.firstName,
                lastName: student.lastName,
                _id: student._id.toString(),
                studentId: student.studentId,
              },
            };
            updateClassroomMembers(data);
            res.status(statusCode.CREATED).json({
              message: 'success',
              classroom: data.classroom,
              student: data.student,
            });
          }

          await student.save();
          await classroom.save();
          // update classroom members
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

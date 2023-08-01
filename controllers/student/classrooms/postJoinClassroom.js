const { upload, multer } = require('../../../middlewares/multer-s3');
const File = require('../../../model/file');
const Student = require('../../../model/studentModel');
const Classroom = require('../../../model/classroom');

exports.postJoinClassroom = async (req, res, next) => {
  const { bucketName } = req.params;
  const { userId } = req;
  upload(bucketName, userId).array('files')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      next(err);
    } else if (err) {
      next(err);
    }
    const { files } = req;
    const { classroomId } = req.body;
    try {
      const student = await Student.findById(req.userId);
      const classroom = await Classroom.findById(classroomId);
      if (!student) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }
      if (!classroom) {
        const error = new Error('Classroom not found');
        error.statusCode = 404;
        throw error;
      }
      // add files to student

      files.forEach((file) => {
        student.machineLearningImages.push({
          location: file.location,
          bucketName: file.bucketName,
          size: file.size,
          mimetype: file.mimetype,
        });
      });

      // check if student already joined the classroom
      const isJoined = classroom.students.find(
        (studentId) => studentId.toString() === student._id.toString()
      );
      if (isJoined) {
        res.status(200).json({ message: 'success' });
      } else {
        // add student to classroom
        classroom.students.push(student);

        await student.save();
        await classroom.save();

        res.status(201).json({ message: 'success' });
      }
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    }
  });
};

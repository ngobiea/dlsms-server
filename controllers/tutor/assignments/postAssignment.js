import Assignment from '../../../model/Assignment.js';
import { statusCode } from '../../../util/statusCodes.js';
import { upload } from '../../../middlewares/multer-s3.js';
import { handleValidationErrors } from '../../../util/validation.js';
import Message from '../../../model/Message.js';
import Classroom from '../../../model/Classroom.js';
import User from '../../../model/User.js';
import { handlePostAssignments } from '../../../socketHandlers/tutors/handlePostAssignments.js';
import path from 'path';
const __dirname = path.resolve();

import { createFolderIfNotExists } from '../../../util/createFolder.js';
export const postAssignment = async (req, res, next) => {
  try {
    const { classroomId } = req.params;
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      const error = new Error('Classroom not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const tutor = await User.findById(req.userId);

    upload(process.env.DLSMS_CLASS_ASSIGNMENTS, classroomId).array('files')(
      req,
      res,
      async (err) => {
        if (err) {
          next(err);
        }
        handleValidationErrors(req, res, async () => {
          try {
            const { files } = req;
            const { title, instruction, dueDate, points } = req.body;

            const assignment = {
              title,
              instruction,
              dueDate,
              points,
              files:
                files?.map((file) => ({
                  name: file.originalname,
                  location: file.location,
                  key: file.key,
                  bucketName: process.env.DLSMS_CLASS_ASSIGNMENTS,
                  size: file.size,
                  mimetype: file.mimetype,
                })) || [],
              classroom: classroomId,
            };
            const newAssignment = new Assignment(assignment);
            await newAssignment.save();

            const message = new Message({
              classroomId,
              sender: req.userId,
              text: `Assignment ${title} has been created`,
              type: 'assignment',
              assignment: newAssignment,
            });
            await message.save();
            const savedAssignment = {
              message: {
                _id: message._id.toString(),
                sender: {
                  _id: req.userId,
                  firstName: tutor.firstName,
                  lastName: tutor.lastName,
                },
                text: message.text,
                type: message.type,
                assignment: {
                  _id: newAssignment._id.toString(),
                  classroom: classroomId,
                  title,
                  dueDate,
                },
                timestamp: message.timestamp,
              },
              classroomId,
            };
            handlePostAssignments(savedAssignment);
            res.status(statusCode.CREATED).json({
              savedAssignment,
            });
          } catch (error) {
            if (!error.statusCode) {
              error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
            }
            next(error);
          }
        });
      }
    );
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

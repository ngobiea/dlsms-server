import Assignment from '../../../model/Assignment.js';
import { statusCode } from '../../../util/statusCodes.js';
import { handleValidationErrors } from '../../../util/validation.js';
import { uploadToDisk } from '../../../middlewares/multer-disk.js';
import User from '../../../model/User.js';
import { CopyLeaksPlagiarismChecker } from '../../../copyleaks/plagiarism.js';
export const postSubmitAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      const error = new Error('Assignment not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    uploadToDisk().array('files')(req, res, async (err) => {
      if (err) {
        next(err);
      }
      handleValidationErrors(req, res, async () => {
        try {
          const { files } = req;
          const submission = {
            files:
              files?.map((file) => ({
                name: file.originalname,
                location: file.path,
                key: file.path,
                bucketName: file.destination,
                size: file.size,
                mimetype: file.mimetype,
              })) || [],
            student: req.userId,
          };
          assignment.submissions.push(submission);
          await assignment.save();
          const user = await User.findById(req.userId);

          res.status(statusCode.CREATED).json({
            message: 'Assignment submitted successfully',
          });

          const webhookUrl = `${req.protocol}://${req.get(
            'host'
          )}/copyleaks/webhook`;
          const plagiarismChecker = new CopyLeaksPlagiarismChecker();
          await plagiarismChecker.submitFileForPlagiarismCheck({
            filePath: submission.files[0].location,
            submissionId:
              assignment.submissions[
                assignment.submissions.length - 1
              ]._id.toString(),
            fileName: submission.files[0].name,
            webhookUrl,
            name: user.firstName + ' ' + user.lastName,
            title: assignment.title,
          });
        } catch (error) {
          if (!error.statusCode) {
            error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
          }
          next(error);
        }
      });
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

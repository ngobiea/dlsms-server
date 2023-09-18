import ExamSession from '../../../model/ExamSession.js';
import { statusCode } from '../../../util/statusCodes.js';
import { deleteS3Folder } from '../../../util/aws/delete-s3-folder.js';

export const deleteExamSession = async (req, res, next) => {
  try {
    const { examSessionId } = req.params;
    const examSession = await ExamSession.findById(examSessionId);
    if (!examSession) {
      const error = new Error('Exam session not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }

    deleteS3Folder(process.env.EXAM_SESSION_BUCKET, `${examSessionId}/`)
      .then(async () => {
        console.log('Folder deleted');
        await ExamSession.findByIdAndDelete(examSessionId);
        res.status(statusCode.OK).json({ message: 'Exam session deleted' });
      })
      .catch((err) => {
        console.log('Error:', err);
        next(err);
      });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

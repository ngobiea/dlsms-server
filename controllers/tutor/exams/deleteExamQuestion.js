import ExamSession from '../../../model/ExamSession.js';
import { statusCode } from '../../../util/statusCodes.js';
import { deleteS3Objects } from '../../../util/aws/delete-s3-file.js';
export const deleteExamQuestion = async (req, res, next) => {
  try {
    const { examSessionId } = req.params;
    const { id } = req.query;
    const examSession = await ExamSession.findById(examSessionId);
    if (!examSession) {
      const error = new Error('Exam session not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }

    const examQuestion = examSession.examQuestions.find(
      (question) => question._id.toString() === id
    );
    if (!examQuestion) {
      const error = new Error('Exam question not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    if (examQuestion.files.length > 0) {
      await deleteS3Objects(
        process.env.EXAM_SESSION_BUCKET,
        examQuestion.files
      );
    }
    const updatedQuestion = examSession.examQuestions.filter(
      (question) => question._id.toString() !== id
    );
    examSession.questions = updatedQuestion;
    await examSession.save();
    res.status(statusCode.OK).json({ message: 'Exam question deleted', id });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

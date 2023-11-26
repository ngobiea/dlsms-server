import ExamSession from '../../../model/ExamSession.js';
import { statusCode } from '../../../util/statusCodes.js';
export const getQuestions = async (req, res, next) => {
  try {
    const { examSessionId } = req.params;
    const examSession = await ExamSession.findById(examSessionId);
    if (!examSession) {
      const error = new Error('Exam session not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const questions = examSession.examQuestions.map((question) => {

      return {
        question: question.question,
        options: question.options.map((option) => {
          return {
            optionId: option.optionId,
            value: option.value,
          };
        }),
        points: question.points,
        type: question.type,
        files: question.files,
        _id: question._id.toString(),
        correctOption: '',
      };
    });
    res.status(statusCode.OK).json({ questions: questions ? questions : [] });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

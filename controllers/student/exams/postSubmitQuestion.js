import ExamSession from '../../../model/ExamSession.js';
import StudentExamSession from '../../../model/StudentExamSession.js';
import { statusCode } from '../../../util/statusCodes.js';
import { handleValidationErrors } from '../../../util/validation.js';

export const postSubmitExamQuestion = async (req, res, next) => {
  const { userId } = req;
  handleValidationErrors(req, res, async () => {
    try {
      const { examSessionId, answers } = req.body;
      let points = 0;
      const studentExamSession = await StudentExamSession.findOne({
        examSession: examSessionId,
        student: userId,
      });
      const examSession = await ExamSession.findById(examSessionId);
      if (!studentExamSession) {
        const error = new Error('Student exam session not found');
        error.statusCode = statusCode.NOT_FOUND;
        throw error;
      }
      JSON.parse(answers).forEach((answer) => {
        const examQuestion = examSession.examQuestions.find(
          (question) => question._id.toString() === answer._id.toString()
        );
        if (examQuestion.correctOption === answer.correctOption) {
          points += examQuestion.points;
          answer.isCorrect = true;
        }
        studentExamSession.answers.push(answer);
      });
      studentExamSession.points = points;
      await studentExamSession.save();
      res.status(statusCode.OK).json({ message: 'success' });
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
      }
      next(error);
    }
  });
};

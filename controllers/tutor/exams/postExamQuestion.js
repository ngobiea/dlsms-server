import ExamSession from '../../../model/ExamSession.js';
import { statusCode } from '../../../util/statusCodes.js';
import { upload } from '../../../middlewares/multer-s3.js';
import { handleValidationErrors } from '../../../util/validation.js';


export const postExamQuestion = async (req, res, next) => {
  const { examSessionId } = req.params;

  upload(process.env.EXAM_SESSION_BUCKET, examSessionId).array('files')(
    req,
    res,
    async (err) => {
      if (err) {
        next(err);
      }
      handleValidationErrors(req, res, async () => {
        try {
          const { files } = req;
          const { question, points, type, id, options, correctOption } =
            req.body;
          const examSession = await ExamSession.findById(examSessionId);
          if (!examSession) {
            const error = new Error('Exam session not found');
            error.statusCode = statusCode.NOT_FOUND;
            throw error;
          }

          const examQuestion = {
            question,
            points,
            type,
            id,
            options:
              JSON.parse(options || '[]').map(({ optionId, value }) => ({
                optionId,
                value,
              })) || [],
            correctOption: correctOption || null,
            files:
              files.map((file) => ({
                name: file.originalname,
                location: file.location,
                key: file.key,
                bucketName: process.env.EXAM_SESSION_BUCKET,
                size: file.size,
                mimetype: file.mimetype,
              })) || [],
          };
          examSession.examQuestions.push(examQuestion);
          await examSession.save();
          
          const examQuestionId = examSession.examQuestions[examSession.examQuestions.length - 1]._id.toString();
          
          examQuestion.id = examQuestionId;
          res.status(statusCode.CREATED).json(examQuestion);
          
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

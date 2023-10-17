import ExamSession from '../../../model/ExamSession.js';
import StudentExamSession from '../../../model/StudentExamSession.js';
import { statusCode } from '../../../util/statusCodes.js';
export const getExamSessionStatus = async (req, res, next) => {
  try {
    const { examSessionID } = req.params;
  } catch (error) {}
};

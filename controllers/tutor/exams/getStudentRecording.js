import StudentExamSession from '../../../model/StudentExamSession.js';
import { statusCode } from '../../../util/statusCodes.js';
import { AWS } from '../../../util/aws/AWS.js';
import { validationResult } from 'express-validator';
import { extractAfterSecondSlash } from '../../../util/fileTitle.js';
export const getStudentRecording = async (req, res, next) => {
  try {
    console.log('getStudentRecording');

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.BAD_REQUEST;
      error.data = errors.array();
      throw error;
    }
    const { studentExamSessionId } = req.params;
    console.log(req.params);
    const studentExamSession = await StudentExamSession.findById(
      studentExamSessionId
    );
    if (!studentExamSession) {
      const error = new Error('Student exam session not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const { examSessionRecording } = studentExamSession;
    if (!examSessionRecording) {
      const error = new Error('Student exam session recording not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const { bucketName, key } = examSessionRecording;
    const data = await AWS.downloadFile(bucketName, key);
    console.log(extractAfterSecondSlash(key));
    res.set({
      'Content-Type': data.ContentType,
      'Content-Length': data.ContentLength,
      'Content-Disposition': extractAfterSecondSlash(key),
    });
    data.Body.once('error', (error) => {
      console.log(error);
      if (!error.statusCode) {
        error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
      }
      next(error);
    });
    data.Body.pipe(res);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

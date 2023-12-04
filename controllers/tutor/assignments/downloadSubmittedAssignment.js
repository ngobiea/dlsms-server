import Assignment from '../../../model/Assignment.js';
import { statusCode } from '../../../util/statusCodes.js';
import { validationResult } from 'express-validator';
import { AWS } from '../../../util/aws/AWS.js';
export const downloadSubmittedAssignment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.BAD_REQUEST;
      error.data = errors.array();
      throw error;
    }
    const { assignmentId, submissionId } = req.params;
    const foundAssignment = await Assignment.findById(assignmentId);
    if (!foundAssignment) {
      const error = new Error('Assignment not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const foundSubmission = foundAssignment.submissions.find((submission) => {
      return submission._id.toString() === submissionId.toString();
    });
    if (!foundSubmission) {
      const error = new Error('Submission not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    if (!foundSubmission.files.length) {
      const error = new Error('No files found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const { bucketName, key } = foundSubmission?.files[0];
    const data = await AWS.downloadFile(bucketName, key);
    res.set({
      'Content-Type': data.ContentType,
      'Content-Length': data.ContentLength,
      'Content-Disposition': foundSubmission.files[0].name,
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

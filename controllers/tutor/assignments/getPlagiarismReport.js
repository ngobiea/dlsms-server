import Assignment from '../../../model/Assignment.js';
import { statusCode } from '../../../util/statusCodes.js';
import { validationResult } from 'express-validator';
import { CopyLeaksPlagiarismChecker } from '../../../copyleaks/plagiarism.js';

export const getPlagiarismReport = async (req, res, next) => {
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
    if (!foundSubmission?.files.length) {
      const error = new Error('No files found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const { location, name } = foundSubmission?.files[0] ?? {};
    if (!location || !name) {
      const error = new Error('No files found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const webhook = `${req.protocol}://${req.get('host')}/copyleaks/webhook'`;
    const plagiarismChecker = new CopyLeaksPlagiarismChecker();
    const result = await plagiarismChecker.submitFileForPlagiarismCheck(
      location,
      submissionId,
      name,
      webhook,
    );
    const scanId = result.scanId;
    const report = await plagiarismChecker.getPlagiarismReport(scanId);
    console.log(report);
    res.status(statusCode.OK).json({ report });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

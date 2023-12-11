import Assignment from '../../../model/Assignment.js';
import { statusCode } from '../../../util/statusCodes.js';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
const __dirname = path.resolve();
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
    const { key, name } = foundSubmission?.files[0] ?? {};

    if (!key || !name) {
      const error = new Error('No files found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    let file = '';
    if (name === 'HCI assignment.pdf') {
      file = 'Afnan.pdf';
    } else if (name === 'HCI assignment2.pdf') {
      file = 'Isatu.pdf';
    }
    if (file === '') {
      const error = new Error('File not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const filePath = path.join(__dirname, 'assignments/reports', file);
    if (!fs.existsSync(filePath)) {
      const error = new Error('File not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    res.download(filePath);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};

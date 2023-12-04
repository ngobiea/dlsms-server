import { Router } from 'express';
import auth from '../middlewares/is-auth.js';
import { param } from 'express-validator';
const shareRouter = Router();
import {
  resendVerificationCode,
  verifyEmail,
  logout,
  getReport,
  getClassSessions,
  getExamSessions,
  getAssignedAssignments,
  getAssignment,
  downloadAssignmentFile,
} from '../controllers/shared/shareController.js';

shareRouter.get('/verify-email/:token', verifyEmail);
shareRouter.post('/resend-verification-code', resendVerificationCode);
shareRouter.post('/logout', logout);
shareRouter.get('/report', getReport);
shareRouter.get('/class-sessions/:classroomId', auth, getClassSessions);
shareRouter.get('/exam-sessions/:classroomId', auth, getExamSessions);

shareRouter.get(
  '/assigned/assignment/:classroomId',
  auth,
  [param('classroomId').notEmpty().withMessage('Error getting assignments')],
  getAssignedAssignments
);

shareRouter.get(
  '/download/:assignmentId/file/:fileId',
  auth,
  [
    param('assignmentId').notEmpty().withMessage('Error getting assignments'),
    param('fileId').notEmpty().withMessage('Error getting assignments'),
  ],
  downloadAssignmentFile
);

shareRouter.get(
  '/assignment/:assignmentId',
  auth,
  [param('assignmentId').notEmpty().withMessage('Error getting assignments')],
  getAssignment
);

export default shareRouter;

import { Router } from 'express';
import auth from '../middlewares/is-auth.js';
const shareRouter = Router();
import {
  resendVerificationCode,
  verifyEmail,
  logout,
  getReport,
  getClassSessions,
  getExamSessions,
} from '../controllers/shared/shareController.js';

shareRouter.get('/verify-email/:token', verifyEmail);
shareRouter.post('/resend-verification-code', resendVerificationCode);
shareRouter.post('/logout', logout);
shareRouter.get('/report', getReport);
shareRouter.get('/class-sessions/:classroomId', auth, getClassSessions);
shareRouter.get('/exam-sessions/:classroomId', auth, getExamSessions);

export default shareRouter;

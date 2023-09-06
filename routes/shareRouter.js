import { Router } from 'express';
const shareRouter = Router();
import {
  resendVerificationCode,
  verifyEmail,
  logout,
} from '../controllers/shared/shareController.js';

shareRouter.get('/verify-email/:token', verifyEmail);
shareRouter.post('/resend-verification-code', resendVerificationCode);
shareRouter.post('/logout', logout);

export default shareRouter;

import { Router } from 'express';
const router = Router();
import {
  resendVerificationCode,
  verifyEmail,
  logout
} from '../controllers/shared/shareController';

router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification-code', resendVerificationCode);
router.post('/logout', logout);

export default router;

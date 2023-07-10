const express = require('express');
const router = express.Router();
const {
  resendVerificationCode,
  verifyEmail,
  logout
} = require('../controllers/shared/shareController');

router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification-code', resendVerificationCode);
router.post('/logout', logout);

module.exports = router;

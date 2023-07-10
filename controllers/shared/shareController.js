const {signup} = require('./auth/postSignup');
const {login} = require('./auth/postLogin');
const {logout} = require('./auth/logout');
const {resendVerificationCode} = require('./auth/resendVerificationCode');
const {verifyEmail} = require('./auth/verifyEmail');

module.exports = {
  login,
  signup,
  resendVerificationCode,
  verifyEmail,
  logout
};

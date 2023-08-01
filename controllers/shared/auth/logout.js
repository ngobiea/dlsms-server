const { statusCode } = require('../../../util/statusCodes');

exports.logout = (_req, res, _next) => {
  // Clear the token cookie to log the user
  res.clearCookie('token');

  res.status(statusCode.OK).json({ message: 'Logout successful' });
};

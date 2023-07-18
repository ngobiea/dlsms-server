const { statusCode }= require('../../../util/util');

exports.logout = (_req, res, _next) => {
  // Clear the token cookie to log the user
  res.clearCookie('token');

  res.status(statusCode.OK).json({ message: 'Logout successful' });
};

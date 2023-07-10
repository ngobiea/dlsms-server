

exports.logout = (_req, res, _next) => {
  // Clear the token cookie to log the user
  res.clearCookie('token');

  res.status(200).json({ message: 'Logout successful' });
};


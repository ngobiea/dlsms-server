
import { statusCode } from '../../../util/statusCodes.js';
export const logout = (_req, res, _next) => {
  // Clear the token cookie to log the user
  res.clearCookie('token');

  res.status(statusCode.OK).json({ message: 'Logout successful' });
};

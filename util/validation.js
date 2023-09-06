import { validationResult } from 'express-validator';
import { statusCode } from './statusCodes.js';
export const handleValidationErrors = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = statusCode.BAD_REQUEST;
    error.data = errors.array();
    return next(error);
  }
  return next();
};

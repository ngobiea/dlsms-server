import { validationResult } from 'express-validator';
import { statusCode } from './statusCodes';
export function handleValidationErrors(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = statusCode.BAD_REQUEST;
    error.data = errors.array();
    return next(error);
  }
  return next();
}

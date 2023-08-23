import { Router } from 'express';
import {login,signup} from '../controllers/shared/shareController.js';
import {
  createClassroom,
  getClassroom,
  getClassrooms,
  scheduleClassSession,
} from '../controllers/tutor/tutorController.js';

const tutorRouter = Router();
import { body } from 'express-validator';
import auth from '../middlewares/is-auth.js';

tutorRouter.post(
  '/signup',
  [
    body('firstName').trim().notEmpty().withMessage('First Name is required'),
    body('lastName').trim().notEmpty().withMessage('Last Name is required'),
    body('institution')
      .trim()
      .notEmpty()
      .withMessage('Institution is required'),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password is too short'),
    body('accountType').notEmpty().withMessage('Invalid Account Type'),
  ],
  signup
);
tutorRouter.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password is too short'),
  ],
  login
);

tutorRouter.post(
  '/classroom',
  auth,
  [
    body('name').trim().notEmpty().withMessage('classroom name is require'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Classroom description is require'),
  ],
  createClassroom
);
tutorRouter.post(
  '/classroom/schedule',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Schedule Title is required'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Schedule Description is required'),
    body('startDate').trim().notEmpty().withMessage('Start Date is required'),
    body('endDate').trim().notEmpty().withMessage('endDate is required'),
    body('classroomId').notEmpty().withMessage('Error crating schedule'),
  ],
  scheduleClassSession
);

tutorRouter.get('/classroom', auth, getClassrooms);
tutorRouter.get('/classroom/:classroomId', auth, getClassroom);

export default tutorRouter;

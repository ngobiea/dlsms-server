import express from 'express';
import { body } from 'express-validator';
import { signup, login,getClassroom,getClassrooms } from '../controllers/shared/shareController';
import { postJoin,verifyClassroomCode } from '../controllers/student/studentController';

const studentRouter = express.Router();
import auth from '../middlewares/is-auth';

studentRouter.post(
  '/signup',
  [
    body('firstName').trim().notEmpty().withMessage('First Name is required'),
    body('lastName').trim().notEmpty().withMessage('Last Name is required'),
    body('institution')
      .trim()
      .notEmpty()
      .withMessage('Institution is required'),
    body('studentId').trim().notEmpty().withMessage('Student ID is required'),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password is too shot'),
    body('accountType').notEmpty().withMessage('Invalid Account Type'),
  ],
  signup
);
studentRouter.post(
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
    body('accountType').notEmpty().withMessage('Invalid Account Type'),
  ],
  login
);

studentRouter.post(
  '/verify',
  auth,
  [body('code').trim().notEmpty().withMessage('Classroom code is require')],
  verifyClassroomCode
);

studentRouter.post(
  '/join-classroom',
  auth,
  [
    body('classroomId')
      .trim()
      .notEmpty()
      .withMessage('Classroom ID is required'),
  ],
  postJoin
);

studentRouter.get('/classroom', auth, getClassrooms);
studentRouter.get('/classroom/:classroomId', auth, getClassroom);

export default studentRouter ;

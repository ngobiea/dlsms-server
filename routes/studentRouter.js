import express from 'express';
import { body, param } from 'express-validator';
import {
  signup,
  login,
  getClassroom,
  getClassrooms,
} from '../controllers/shared/shareController.js';
import {
  verifyClassroomCode,
  postJoinClassroom,
  getQuestions,
  postSubmitExamQuestion,
  getAssignment,
  postSubmitAssignment,
  getSubmittedAssignments,
} from '../controllers/student/studentController.js';

const studentRouter = express.Router();
import auth from '../middlewares/is-auth.js';

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
  postJoinClassroom
);

studentRouter.get('/classroom', auth, getClassrooms);
studentRouter.get('/classroom/:classroomId', auth, getClassroom);

studentRouter.get('/exam-session/questions/:examSessionId', auth, getQuestions);
studentRouter.post(
  '/exam-session/submit',
  auth,
  [
    body('examSessionId')
      .trim()
      .notEmpty()
      .withMessage('Exam Session ID is required'),
    body('answers').isArray().withMessage('Answer is required'),
  ],
  postSubmitExamQuestion
);

studentRouter.get(
  '/assignment/:assignmentId',
  auth,
  [param('assignmentId').notEmpty().withMessage('Error getting assignments')],
  getAssignment
);

studentRouter.post(
  '/assignment/submit/:assignmentId',
  auth,
  [
    param('assignmentId')
      .trim()
      .notEmpty()
      .withMessage('Assignment ID is required'),
  ],
  postSubmitAssignment
);

studentRouter.get(
  '/assignment/submitted/:classroomId',
  auth,
  [
    param('classroomId')
      .trim()
      .notEmpty()
      .withMessage('Classroom ID is required'),
  ],
  getSubmittedAssignments
);

export default studentRouter;

import { Router } from 'express';
import { login, signup } from '../controllers/shared/shareController.js';
import { body, param } from 'express-validator';
import auth from '../middlewares/is-auth.js';
import {
  createClassroom,
  getClassroom,
  getClassrooms,
  scheduleClassSession,
  scheduleExamSession,
  deleteExamSession,
  deleteExamQuestion,
  postExamQuestion,
  postSaveExamSession,
  getStudentClassSession,
  getStudentExamSession,
  getStudentRecording,
  getSESReport,
  getESReport,
  getCSReport,
} from '../controllers/tutor/tutorController.js';

const tutorRouter = Router();

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
tutorRouter.post(
  '/exam-session',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Schedule Title is required'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Schedule Description is required'),
    body('startDate').trim().notEmpty().withMessage('Start Date is required'),
    body('endDate').trim().notEmpty().withMessage('endDate is required'),
    body('classroomId').notEmpty().withMessage('Error creating schedule'),
  ],
  scheduleExamSession
);
tutorRouter.post(
  '/exam-session/question/:examSessionId',
  auth,
  [
    body('id').notEmpty().withMessage('Error creating form'),
    body('question').notEmpty().withMessage('Question is required'),
    body('options')
      .optional()
      .isArray()
      .withMessage('options must be an array'),
    body('correctOption')
      .optional()
      .notEmpty()
      .withMessage('Correct Option is required'),
    body('points').notEmpty().withMessage('Points is required'),
    body('type').notEmpty().withMessage('Type is required'),
    param('examSessionId').notEmpty().withMessage('Error creating form'),
  ],
  postExamQuestion
);
tutorRouter.delete('/exam-session/:examSessionId', auth, deleteExamSession);
tutorRouter.delete(
  '/exam-session/question/:examSessionId',
  auth,
  deleteExamQuestion
);
tutorRouter.patch(
  '/exam-session/save',
  auth,
  [body('examSessionId').notEmpty()],
  postSaveExamSession
);
tutorRouter.get('/classroom', auth, getClassrooms);
tutorRouter.get('/classroom/:classroomId', auth, getClassroom);
tutorRouter.get(
  '/exam-session/students/:examSessionId',
  auth,
  [param('examSessionId').notEmpty()],
  getStudentExamSession
);
tutorRouter.get(
  '/class-session/students/:classSessionId',
  auth,
  [param('classSessionId').notEmpty()],
  getStudentClassSession
);

tutorRouter.get(
  '/exam-session/recording/:studentExamSessionId',
  auth,
  [param('studentExamSessionId').notEmpty()],
  getStudentRecording
);
tutorRouter.get(
  '/exam-session/report/:studentExamSessionId',
  auth,
  [param('studentExamSessionId').notEmpty()],
  getSESReport
);
tutorRouter.get(
  '/exam-session/reports/:examSessionId',
  auth,
  [param('examSessionId').notEmpty()],
  getESReport
);
tutorRouter.get(
  '/class-session/reports/:classSessionId',
  auth,
  [param('classSessionId').notEmpty()],
  getCSReport
);

export default tutorRouter;

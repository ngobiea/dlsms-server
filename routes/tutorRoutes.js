const express = require('express');
const { login, signup } = require('../controllers/shared/shareController');
const {
  createClassroom,
  getClassroom,
  getClassrooms,
  scheduleClassSession,
} = require('../controllers/tutor/tutorController');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middlewares/is-auth');

router.post(
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
router.post(
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

router.post(
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
router.post(
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

router.get('/classroom', auth, getClassrooms);
router.get('/classroom/:classroomId', auth, getClassroom);

module.exports = router;

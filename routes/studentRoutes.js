const express = require('express');
const { body } = require('express-validator');
const { login, signup } = require('../controllers/shared/shareController');
const {
  verifyClassroomCode,
  getClassroom,
  getClassrooms,
  postJoinClassroom,
  postJoin
} = require('../controllers/student/studentController');

const router = express.Router();
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
    body('accountType').notEmpty().withMessage('Invalid Account Type'),
  ],
  login
);

router.post(
  '/verify',
  auth,
  [body('code').trim().notEmpty().withMessage('Classroom code is require')],
  verifyClassroomCode
);

router.post(
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

router.get('/classroom', auth, getClassrooms);
router.get('/classroom/:classroomId', auth, getClassroom);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const { login, signup } = require('../controllers/shared/shareController');
const {
  verifyClassroomCode,
  getClassroom,
  getClassrooms,
  postJoinClassroom,
} = require('../controllers/student/studentController');
const { upload } = require('../middlewares/multer-s3');
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
  ],
  login
);

router.post(
  '/verify',
  [body('code').trim().notEmpty().withMessage('Classroom code is require')],
  auth,
  verifyClassroomCode
);

router.post('/join-classroom/:bucketName', auth, postJoinClassroom);

router.get('/classroom', auth, getClassrooms);
router.get('/classroom/:classroomId', auth, getClassroom);

// router.get('/classrooms/:code', auth, studentController.getClassroom);

module.exports = router;

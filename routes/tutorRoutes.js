const express = require('express');
const tutorController = require('../controllers/tutor/tutorController');
const { login, signup } = require('../controllers/shared/shareController');
const {
  createClassroom,
  getClassroom,
  getClassrooms,
} = require('../controllers/tutor/tutorController');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middlewares/is-auth');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

const multerS3 = require('multer-s3');
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: 'dlsms-assignment',
    metadata: function (_req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (_req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    },
  }),
});

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
      .notEmpty()
      .withMessage('Classroom description is require'),
    body('code').notEmpty().withMessage('Failed generation of classroom code'),
  ],
  createClassroom
);

router.get('/classroom', auth, getClassrooms);
router.get('/classroom/:classroomId', auth, getClassroom);

// router.post(
//   '/create-assignment',
//   auth,
//   upload.array('files', 10),
//   tutorController.createAssignment
// );
// router.get('/classrooms', auth, tutorController.getClassrooms);

module.exports = router;

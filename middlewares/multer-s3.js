const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

const s3 = new S3Client({
  region: 'ap-south-1',
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'dlsms-training-data',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, 'ngobie/' + Date.now().toString() + '-' + file.originalname);
    },
  }),
});

module.exports = { upload };

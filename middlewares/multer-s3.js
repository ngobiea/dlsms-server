const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3 } = require('../util/aws/aws-setup');
const { crateFolderInBucket } = require('../util/aws/create-s3-folder');

const upload = (bucketName, folderName) => {
  crateFolderInBucket(s3, bucketName, folderName);
  return multer({
    storage: multerS3({
      s3,
      bucket: bucketName,
      metadata: (_req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (_req, file, cb) => {
        if (file.originalname === 'blob') {
          cb(null, `${folderName}/${Date.now().toString()}.jpg`);
        } else {
          cb(
            null,
            `${folderName}/${Date.now().toString()}-${file.originalname}`
          );
        }
      },
    }),
  });
};

module.exports = { upload, multer };

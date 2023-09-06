import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3 } from '../util/aws/aws-setup.js';
import { crateFolderInBucket } from '../util/aws/create-s3-folder.js';

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

export { upload, multer };

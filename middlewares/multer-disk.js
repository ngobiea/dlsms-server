import multer from 'multer';

const uploadToDisk = () => {
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, 'assignments/');
      },
      filename: (_req, file, cb) => {
        cb(null, `${Date.now().toString()}-${file.originalname}`);
      },
    }),
  });
};

export { uploadToDisk, multer };

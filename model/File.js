import { Schema } from 'mongoose';

const File = new Schema({
  name: {
    type: String,
  },
  bucketName: {
    type: String,
  },
  location: {
    type: String,
  },
  size: {
    type: Number,
  },
  mimetype: {
    type: String,
  },
  key: {
    type: String,
  },
});
export default File;

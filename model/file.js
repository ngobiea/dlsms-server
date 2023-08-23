import { Schema as _Schema } from 'mongoose';

const Schema = _Schema;

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
});
export default File;

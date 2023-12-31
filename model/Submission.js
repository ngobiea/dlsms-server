import { Schema } from 'mongoose';
import File from './File.js';

const Submission = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  files: [File],
  points: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  graded: {
    type: Boolean,
    default: false,
  },
  comment: {
    type: String,
    default: '',
  },
});

export default Submission;

import { Schema, model } from 'mongoose';
import File from './File.js';
import Submission from './Submission.js';
const Assignment = new Schema({
  classroom: {
    type: Schema.Types.ObjectId,
    ref: 'Classroom',
  },
  title: {
    type: String,
    required: true,
  },
  instruction: {
    type: String,
  },
  dueDate: {
    type: Date,
  },
  points: {
    type: Number,
  },
  files: [File],
  status: {
    type: String,
    default: 'assigned',
  },
  submissions: [Submission],
});

export default model('Assignment', Assignment);

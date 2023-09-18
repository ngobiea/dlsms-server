import { Schema , model } from 'mongoose';
import File from './File';

const Submission = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
  },
  files: [File],
  grade: {
    type: Number,
  },
  graded: {
    type: Boolean,
  },
  gradedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

export default model('Submission', Submission);

import { Schema as _Schema, model } from 'mongoose';
import File from './file';
const Schema = _Schema;

const SubmissionSchema = new Schema({
  studentId: {
    type: _Schema.Types.ObjectId,
    ref: 'Student',
  },
  assignmentId: {
    type: _Schema.Types.ObjectId,
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
    type: _Schema.Types.ObjectId,
    ref: 'Tutor',
  },
});

export default model('Submission', SubmissionSchema);

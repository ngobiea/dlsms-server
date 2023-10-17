import { Schema, model } from 'mongoose';
import Violation from './Violation.js';
import BrowsingHistory from './BrowsingHistory.js';
import File from './File.js';
const StudentExamSession = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  examSession: {
    type: Schema.Types.ObjectId,
    ref: 'ExamSession',
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  violations: [Violation],
  browsingHistory: [BrowsingHistory],
  examSessionRecording: File,
  marks: {
    type: Number,
  },
  comment: {
    type: String,
  },
});

export default model('StudentExamSession', StudentExamSession);

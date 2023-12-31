import { Schema, model } from 'mongoose';
import Violation from './Violation.js';
import ExamQuestion from './ExamQuestion.js';
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
  points: {
    type: Number,
    default: 0,
  },
  comment: {
    type: String,
    default: '',
  },
  answers: [ExamQuestion],
});

export default model('StudentExamSession', StudentExamSession);

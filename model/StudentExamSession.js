<<<<<<< HEAD
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
  },
  comment: {
    type: String,
  },
  answers: [ExamQuestion],
});

export default model('StudentExamSession', StudentExamSession);
=======
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
  marks: {
    type: Number,
  },
  comment: {
    type: String,
  },
  answers: [ExamQuestion],
});

export default model('StudentExamSession', StudentExamSession);
>>>>>>> e23f8c2e82f3ef458a99065a0f7e8b9e0a7ccfd0

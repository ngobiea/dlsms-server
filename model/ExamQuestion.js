import { Schema } from 'mongoose';

import File from './File.js';

const Option = new Schema({
  optionId: {
    type: String,
  },
  value: {
    type: String,
  },
});

const ExamQuestion = new Schema({
  question: {
    type: String,
  },
  options: [Option],
  correctOption: {
    type: String,
  },
  points: {
    type: Number,
  },
  type: {
    type: String,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  files: [File],
});

export default ExamQuestion;

import { Schema as _Schema } from 'mongoose';

const Schema = _Schema;
import File from './file';

const ExamQuestionSchema = new Schema({
  question: {
    type: String,
  },
  options: [String],
  answer: {
    type: String,
  },
  marks: {
    type: Number,
  },
  negativeMarks: {
    type: Number,
  },
  file: File,
});

export default ExamQuestionSchema;

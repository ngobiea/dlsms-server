import { Schema, model } from 'mongoose';
import ExamQuestion from './ExamQuestion.js';

const ExamSession = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    default: 'pending',
  },
  tutor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  classroomId: {
    type: Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true,
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: 'StudentExamSession',
    },
  ],
  totalPoint: {
    type: Number,
  },
  examQuestions: [ExamQuestion],
});

export default model('ExamSession', ExamSession);


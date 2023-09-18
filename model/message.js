import { Schema, model } from 'mongoose';
import File from './File.js';
const Message = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  classroomId: {
    type: Schema.Types.ObjectId,
    ref: 'Classroom',
  },
  text: {
    type: String,
  },
  type: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  file: [File],
  classSession: {
    type: Schema.Types.ObjectId,
    ref: 'ClassSession',
  },
  examSession: {
    type: Schema.Types.ObjectId,
    ref: 'ExamSession',
  },
  poll: {
    type: Schema.Types.ObjectId,
    ref: 'Poll',
  },
});

export default model('Message', Message);

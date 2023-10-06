import { Schema, model } from 'mongoose';

const Attendance = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  sessionId: {
    type: Schema.Types.ObjectId,
  },
  sessionType: {
    type: String,
  },
});

export default model('Attendance', Attendance);

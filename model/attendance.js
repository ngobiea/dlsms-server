import { Schema as _Schema, model } from 'mongoose';

const Schema = _Schema;

const AttendanceSchema = new Schema({
  studentId: {
    type: _Schema.Types.ObjectId,
    ref: 'Student',
  },
  sessionId: {
    type: _Schema.Types.ObjectId,
  },
  sessionType: {
    type: String,
  },
});

export default model('Attendance', AttendanceSchema);

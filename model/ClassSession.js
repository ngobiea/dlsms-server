import { Schema, model } from 'mongoose';

const ClassSession = new Schema({
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
  },
  endDate: {
    type: Date,
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
      ref: 'User',
    },
  ],
});

export default model('ClassSession', ClassSession);

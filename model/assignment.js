import { Schema, model } from 'mongoose';
import File from './File';


const Assignment = new Schema({
  classroom: {
    type: Schema.Types.ObjectId,
    ref: 'Classroom',
  },
  title: {
    type: String,
    required: true,
  },
  instruction: {
    type: String,
  },
  dueDate: {
    type: Date,
  },
  dueTime: {
    type: String,
  },
  points: {
    type: Number,
  },
  submissions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Submission',
    },
  ],
  files: [File],
});

export default model('Assignment', Assignment);

<<<<<<< HEAD
import { Schema, model } from 'mongoose';
import Verify from './Verify.js';

const StudentClassSession = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  classSession: {
    type: Schema.Types.ObjectId,
    ref: 'ClassSession',
    required: true,
  },
  startTime: [
    {
      type: Date,
    },
  ],
  endTime: [
    {
      type: Date,
    },
  ],
  verify: [Verify],
  attendance: {
    type: String,
    default: '0',
  },
});

export default model('StudentClassSession', StudentClassSession);
=======
import { Schema, model } from 'mongoose';
import Verify from './Verify.js';

const StudentClassSession = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  classSession: {
    type: Schema.Types.ObjectId,
    ref: 'ClassSession',
    required: true,
  },
  startTime: [
    {
      type: Date,
    },
  ],
  endTime: [
    {
      type: Date,
    },
  ],
  verify: [Verify],
});

export default model('StudentClassSession', StudentClassSession);
>>>>>>> e23f8c2e82f3ef458a99065a0f7e8b9e0a7ccfd0

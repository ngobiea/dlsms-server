import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;
import File from './file';

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  institution: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['tutor', 'student'],
    required: true,
  },
  studentId: {
    type: String,
  },
  machineLearningImages: [File],
});

UserSchema.index({ email: 1, studentId: 1 }, { unique: true });

export default model('User', UserSchema);
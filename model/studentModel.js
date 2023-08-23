import { Schema as _Schema, model } from 'mongoose';
import FileSchema from './file';
const Schema = _Schema;

const StudentSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  studentId: {
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
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    require: true,
    default: false,
  },
  machineLearningImages: [FileSchema],
  verificationImages: [FileSchema],

});

export default model('Student', StudentSchema);

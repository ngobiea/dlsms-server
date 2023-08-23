import { Schema, model } from 'mongoose';
import File from './file';
const MachineLearningImage = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
  },
  machineLearningImages: [File],
  verificationImages: [File],
});
export default model('MachineLearningImage', MachineLearningImage);
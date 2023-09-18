import { Schema, model } from 'mongoose';
import File from './File';
const MachineLearningImage = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  machineLearningImages: [File],
  verificationImages: [File],
});
export default model('MachineLearningImage', MachineLearningImage);
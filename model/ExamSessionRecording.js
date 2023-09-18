import { Schema } from 'mongoose';
import FileSchema from './File';

const ExamSessionRecording = new Schema({
  file: FileSchema,
  date: {
    type: Date,
  },
  duration: {
    type: Number,
  },
});

export default ExamSessionRecording;

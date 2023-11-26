import { Schema, model } from 'mongoose';
import FileSchema from './File';


const ClassSessionRecording = new Schema({
  classSession: {
    type: Schema.Types.ObjectId,
    ref: 'ClassroomSession',
  },
  file: FileSchema,
  date: {
    type: Date,
  },
  duration: {
    type: Number,
  },
});

export default model('ClassSessionRecording', ClassSessionRecording);

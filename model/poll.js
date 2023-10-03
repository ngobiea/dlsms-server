import { Schema, model } from 'mongoose';


const Options = new Schema({
  option: {
    type: String,
  },
  votes: {
    type: Number,
  },
});
const Poll = new Schema({
  title: {
    type: String,
    required: true,
  },
  classroomId: {
    type: Schema.Types.ObjectId,
    ref: 'Classroom',
  },
  question: {
    type: String,
    required: true,
  },
  voters: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  options: [Options],
  date: {
    type: Date,
  },
});
export default model('Poll', Poll);

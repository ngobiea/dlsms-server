import { Schema, model } from 'mongoose';


const Classroom = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  tutor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});
Classroom.index({ name: 1, tutor: 1 }, { unique: true });

export default model('Classroom', Classroom);

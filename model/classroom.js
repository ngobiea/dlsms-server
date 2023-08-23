import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const ClassroomSchema = new Schema({
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
ClassroomSchema.index({ name: 1, tutor: 1 }, { unique: true });

export default model('Classroom', ClassroomSchema);

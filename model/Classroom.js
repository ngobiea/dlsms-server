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

Classroom.statics.addStudent = async function (classroomId, studentId) {
  try {
    return await this.updateOne(
      { _id: classroomId },
      { $addToSet: { students: studentId } }
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default model('Classroom', Classroom);

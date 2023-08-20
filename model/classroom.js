const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

module.exports = mongoose.model('Classroom', ClassroomSchema);

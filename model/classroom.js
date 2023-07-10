const mongoose = require("mongoose");
const File = require("./file");
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
  tutorId: {
    type: Schema.Types.ObjectId,
    ref: "Tutor",
    required: true,
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  files: [File],
});
ClassroomSchema.index({ name: 1, tutorId: 1 }, { unique: true });

module.exports = mongoose.model("Classroom", ClassroomSchema);

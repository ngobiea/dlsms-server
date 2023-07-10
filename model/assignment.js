const mongoose = require("mongoose");
const File = require("./file");
const Schema = mongoose.Schema;

const AssignmentSchema = new Schema({
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
  },
  title: {
    type: String,
    required: true,
  },
  instruction: {
    type: String,
  },
  dueDate: {
    type: Date,
  },
  dueTime: {
    type: String,
  },
  points: {
    type: Number,
  },
  submissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
    },
  ],
  files: [File],
});

module.exports = mongoose.model("Assignment", AssignmentSchema);

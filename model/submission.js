const mongoose = require("mongoose");
const File = require("./file");
const Schema = mongoose.Schema;

const SubmissionSchema = new Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
  },
  files: [File],
  grade: {
    type: Number,
  },
  graded: {
    type: Boolean,
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
  },
});

module.exports = mongoose.model("Submission", SubmissionSchema);

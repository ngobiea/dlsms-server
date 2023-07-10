const mongoose = require("mongoose");
const Violation = require("./violation");
const BrowsingHistory = require("./browsingHistory");
const ExamSessionRecording = require("./ExamSessionRecording");

const Schema = mongoose.Schema;
const StudentExamSession = new Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  examSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamSession",
  },
  status: {
    type: String,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  violations: [Violation],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  browsingHistory: [BrowsingHistory],
  examSessionRecording: [ExamSessionRecording],
  marks: {
    type: Number,
  },
  comment: {
    type: String,
  },
});

module.exports = mongoose.model("StudentExamSession", StudentExamSession);

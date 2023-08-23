import { Schema as _Schema, model } from "mongoose";
import Violation from "./violation";
import BrowsingHistory from "./browsingHistory";
import ExamSessionRecording from "./ExamSessionRecording";

const Schema = _Schema;
const StudentExamSession = new Schema({
  studentId: {
    type: _Schema.Types.ObjectId,
    ref: "Student",
  },
  examSessionId: {
    type: _Schema.Types.ObjectId,
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

export default model("StudentExamSession", StudentExamSession);

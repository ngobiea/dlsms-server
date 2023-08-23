import { Schema as _Schema, model } from "mongoose";
import File from "./file";
const Schema = _Schema;

const AssignmentSchema = new Schema({
  classroom: {
    type: _Schema.Types.ObjectId,
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
      type: _Schema.Types.ObjectId,
      ref: "Submission",
    },
  ],
  files: [File],
});

export default model("Assignment", AssignmentSchema);

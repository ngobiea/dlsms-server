import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const Plagiarism = new Schema({
  studentId: {
    type: _Schema.Types.ObjectId,
    ref: "Student",
  },
  submissionId: {
    type: _Schema.Types.ObjectId,
    ref: "Assignment",
  },
  originalityScore: {
    type: Number,
  },
  matchedSources: [
    {
      url: {
        type: String,
      },
      similarityScore: {
        type: Number,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export default model("PlagiarismReport", Plagiarism);

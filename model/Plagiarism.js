const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Plagiarism = new Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
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
module.exports = mongoose.model("PlagiarismReport", Plagiarism);

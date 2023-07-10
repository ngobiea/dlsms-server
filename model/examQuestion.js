const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const File = require("./file");

const ExamQuestionSchema = new Schema({
  question: {
    type: String,
  },
  options: [String],
  answer: {
    type: String,
  },
  marks: {
    type: Number,
  },
  negativeMarks: {
    type: Number,
  },
  file: File,
});

module.exports = ExamQuestionSchema;

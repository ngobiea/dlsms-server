const mongoose = require("mongoose");
const ExamQuestionSchema = require("./examQuestion");

const ExamSession = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
  },
  classroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    
  ],
  examQuestions: [ExamQuestionSchema],
});

module.exports = mongoose.model("ExamSession", ExamSession);

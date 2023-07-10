const mongoose = require("mongoose");

const ClassSession = new mongoose.Schema({
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
});

module.exports = mongoose.model("ClassSession", ClassSession);
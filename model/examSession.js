import { Schema, model } from "mongoose";
import ExamQuestionSchema from "./examQuestion";

const ExamSession = new Schema({
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
    type: Schema.Types.ObjectId,
    ref: "Tutor",
  },
  classroomId: {
    type: Schema.Types.ObjectId,
    ref: "Classroom",
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: "Student",
    },
    
  ],
  examQuestions: [ExamQuestionSchema],
});

export default model("ExamSession", ExamSession);

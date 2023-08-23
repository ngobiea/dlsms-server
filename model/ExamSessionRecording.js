import { Schema as _Schema } from "mongoose";
import FileSchema from "./file";
const Schema = _Schema;

const ExamSessionRecordingSchema = new Schema({
  file: FileSchema,
  date: {
    type: Date,
  },
  duration: {
    type: Number,
  },
});

export default ExamSessionRecordingSchema;

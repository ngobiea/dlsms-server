import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;
import FileSchema from "./file";

const ClassSessionRecordingSchema = new Schema({
  classSession: {
    type: _Schema.Types.ObjectId,
    ref: "ClassroomSession",
  },
  file: FileSchema,
  date: {
    type: Date,
  },
  duration: {
    type: Number,
  },
});

export default model("ClassSessionRecording",ClassSessionRecordingSchema);

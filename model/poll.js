import { Schema as _Schema, model } from "mongoose";

const Schema = _Schema;
const Options = new Schema({
  option: {
    type: String,
  },
  votes: {
    type: Number,
  },
});
const PollSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  classroomId: {
    type: Schema.Types.ObjectId,
    ref: "Classroom",
  },
  question: {
    type: String,
    required: true,
  },
  voters: [
    {
      type: Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  options: [Options],
  date: {
    type: Date,
  },
});
export default {
  Poll: mongoose.model("Poll", PollSchema),
  Options,
};

const mongoose = require("mongoose");

const Schema = mongoose.Schema;
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
module.exports = {
  Poll: mongoose.model("Poll", PollSchema),
  Options,
};

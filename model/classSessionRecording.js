const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const FileSchema = require("./file");

const ClassSessionRecordingSchema = new Schema({
  classSession: {
    type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model("ClassSessionRecording",ClassSessionRecordingSchema);

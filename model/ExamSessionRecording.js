const mongoose = require("mongoose");
const FileSchema = require("./file");
const Schema = mongoose.Schema;

const ExamSessionRecordingSchema = new Schema({
  file: FileSchema,
  date: {
    type: Date,
  },
  duration: {
    type: Number,
  },
});

module.exports = ExamSessionRecordingSchema;

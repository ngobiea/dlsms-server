const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  sessionType: {
    type: String,
  },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
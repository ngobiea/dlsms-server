const mongoose = require("mongoose");
const FileSchema = require("./file");
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  studentId: {
    type: String,
    required: true,
  },
  institution: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    require: true,
    default: false,
  },
  machineLearningImages: [FileSchema],
  verificationImages: [FileSchema],
  classrooms: [
    {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
    },
  ],
});

module.exports = mongoose.model("Student", StudentSchema);

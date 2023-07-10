const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TutorSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
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
    required: true,
    default: false,
  },
  classrooms: [
    {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
    },
  ],
});

module.exports = mongoose.model("Tutor", TutorSchema);

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Sender = new Schema({
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
});

module.exports = Sender;

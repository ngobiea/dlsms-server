const mongoose = require("mongoose");
const Sender = require("./sender");
const MessageSchema = new mongoose.Schema({
  sender: Sender,
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
  },
  text: {
    type: String,
  },
  type: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  received: {
    type: Boolean,
  }
});

module.exports = mongoose.model("Message", MessageSchema);

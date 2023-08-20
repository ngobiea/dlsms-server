const mongoose = require('mongoose');
const File = require('./file');
const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  classroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
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
  file: [File],
  classSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSession',
  },
  examSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamSession',
  },
  poll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
  },
});

module.exports = mongoose.model('Message', MessageSchema);

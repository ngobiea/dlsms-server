const mongoose = require('mongoose');
const File = require('./file');
const MachineLearningImage = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  machineLearningImages: [File],
  verificationImages: [File],
});
module.exports = mongoose.model('MachineLearningImage', MachineLearningImage);
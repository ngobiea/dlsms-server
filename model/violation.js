const mongoose = require("mongoose");

const Violation = new mongoose.Schema({
  violationType: {
    type: String,
  },
  violationTime: {
    type: Date,
  },
});

module.exports = Violation;
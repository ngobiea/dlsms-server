const mongoose = require('mongoose');

const BrowsingHistory = new mongoose.Schema({
  title: {
    type: String,
  },
  utc_time: {
    type: Date,
  },
  url: {
    type: String,
  },
  browser: {
    type: String,
  },
});

module.exports = BrowsingHistory
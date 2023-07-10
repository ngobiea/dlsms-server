const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const File = new Schema({
  name: {
    type: String,
  },
  type: {
    type: String,
  },
  path: {
    type: String,
  },
  size: {
    type: Number,
  },
  mimetype: {
    type: String,
  },
});
module.exports = File;
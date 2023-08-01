const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const File = new Schema({
  name: {
    type: String,
  },
  bucketName: {
    type: String,
  },
  location: {
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
import { Schema } from 'mongoose';


const BrowsingHistory = new Schema({
  title: {
    type: String,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  url: {
    type: String,
  },
  browser: {
    type: String,
  },
});

export default BrowsingHistory;

import { Schema } from 'mongoose';

const BrowsingHistory = new Schema({
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

export default BrowsingHistory
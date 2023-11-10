import { Schema } from 'mongoose';

const Violation = new Schema({
  type: {
    type: String,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  time: {
    type: Date,
    default: Date.now,
  },
});

export default Violation;

import { Schema } from 'mongoose';

const Violation = new Schema({
  violationType: {
    type: String,
  },
  description: {
    type: String,
  },
  violationTime: {
    type: Date,
    default: Date.now,
  },
});

export default Violation;

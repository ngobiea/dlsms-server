import { Schema } from 'mongoose';

const Verify = new Schema({
  isVerify: {
    type: Boolean,
  },
  time: {
    type: Date,
    default: Date.now,
  },
});

export default Verify;

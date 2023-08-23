import { Schema } from "mongoose";

const Violation = new Schema({
  violationType: {
    type: String,
  },
  violationTime: {
    type: Date,
  },
});

export default Violation;
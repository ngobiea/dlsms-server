import { Schema as _Schema } from "mongoose";

const Schema = _Schema;

const Sender = new Schema({
  tutor: {
    type: _Schema.Types.ObjectId,
    ref: "Tutor",
  },
  student: {
    type: _Schema.Types.ObjectId,
    ref: "Student",
  },
});

export default Sender;

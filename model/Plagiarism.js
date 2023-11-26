import { Schema, model } from 'mongoose';


const Plagiarism = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  submissionId: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
  },
  originalityScore: {
    type: Number,
  },
  matchedSources: [
    {
      url: {
        type: String,
      },
      similarityScore: {
        type: Number,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export default model('Plagiarism', Plagiarism);

import mongoose from 'mongoose';

const feedbackSchema = mongoose.Schema(
  {
    scanType: {
      type: String,
      required: true,
      enum: ['url', 'text', 'vision']
    },
    originalInput: {
      type: String,
      required: true
    },
    predictedResult: {
      type: String,
      required: true
    },
    reportedAs: {
      type: String, // 'False Positive' or 'False Negative'
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;

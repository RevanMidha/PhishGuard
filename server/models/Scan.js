import mongoose from 'mongoose';

const scanSchema = mongoose.Schema(
  {
    scanType: {
      type: String,
      required: true,
      enum: ['url', 'text', 'vision']
    },
    inputSnippet: {
      type: String,
      required: true
    },
    result: {
      type: String,
      required: true,
      enum: ['safe', 'suspicious', 'malicious', 'error']
    },
    confidenceScore: {
      type: Number,
      required: false
    }
  },
  {
    timestamps: true
  }
);

const Scan = mongoose.model('Scan', scanSchema);

export default Scan;

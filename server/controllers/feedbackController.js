import Feedback from '../models/Feedback.js';

export const submitFeedback = async (req, res) => {
  try {
    const { scanType, originalInput, predictedResult, reportedAs } = req.body;

    if (!scanType || !originalInput || !predictedResult || !reportedAs) {
      return res.status(400).json({ error: 'Please provide all necessary feedback fields' });
    }

    const feedback = await Feedback.create({
      scanType,
      originalInput,
      predictedResult,
      reportedAs
    });

    res.status(201).json({ message: 'Feedback successfully recorded', data: feedback });
  } catch (error) {
    console.error('Feedback Submission Error:', error.message);
    res.status(500).json({ error: 'Server error while submitting feedback' });
  }
};

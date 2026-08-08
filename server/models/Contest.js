const mongoose = require('mongoose');
const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  joinId: {
    type: String,
    unique: true,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },

  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  author: {
    type: String,
    required: true,
  },
  rules: {
    type: [String],
    default: [],
  },

  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'ended'],
  },

  violations: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: String,
  }],

}, { timestamps: true });

module.exports = mongoose.models.Contest || mongoose.model('Contest', contestSchema);

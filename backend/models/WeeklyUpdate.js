const mongoose = require('mongoose');

const weeklyUpdateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0, 'Weight must be positive']
  },
  mood: {
    type: String,
    required: [true, 'Mood is required'],
    enum: ['excellent', 'good', 'okay', 'poor', 'terrible']
  },
  photoUrl: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  weekStartDate: {
    type: Date,
    default: function() {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek;
      return new Date(now.setDate(diff));
    }
  },
  isReviewed: {
    type: Boolean,
    default: false
  },
  adminFeedback: {
    type: String,
    trim: true,
    maxlength: [500, 'Admin feedback cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
weeklyUpdateSchema.index({ user: 1, createdAt: -1 });
weeklyUpdateSchema.index({ weekStartDate: 1 });

// Ensure one update per user per week
weeklyUpdateSchema.index({ user: 1, weekStartDate: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyUpdate', weeklyUpdateSchema);

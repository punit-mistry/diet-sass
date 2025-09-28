const mongoose = require('mongoose');

const mealRecallSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  meals: [{
    time: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  isReviewed: {
    type: Boolean,
    default: false
  },
  adminFeedback: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
mealRecallSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
mealRecallSchema.index({ user: 1, date: -1 });
mealRecallSchema.index({ date: -1 });

module.exports = mongoose.model('MealRecall', mealRecallSchema);

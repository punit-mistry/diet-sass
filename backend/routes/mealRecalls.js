const express = require('express');
const router = express.Router();
const MealRecall = require('../models/MealRecall');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   GET /api/meal-recalls
// @desc    Get meal recalls for user or all (admin)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { clientId, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // If admin, can filter by client
    if (req.user.role === 'admin' && clientId) {
      query.user = clientId;
    } else if (req.user.role === 'client') {
      // Client can only see their own recalls
      query.user = req.user.id;
    }
    
    // Date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    const skip = (page - 1) * limit;
    
    let mealRecalls;
    let total;
    
    if (req.user.role === 'admin') {
      // Admin gets all recalls with user details
      mealRecalls = await MealRecall.find(query)
        .populate('user', 'name email')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      total = await MealRecall.countDocuments(query);
    } else {
      // Client gets only their recalls
      mealRecalls = await MealRecall.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      total = await MealRecall.countDocuments(query);
    }
    
    res.json({
      mealRecalls,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching meal recalls:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/meal-recalls/:id
// @desc    Get single meal recall
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const mealRecall = await MealRecall.findById(req.params.id).populate('user', 'name email');
    
    if (!mealRecall) {
      return res.status(404).json({ message: 'Meal recall not found' });
    }
    
    // Check if user can access this recall
    if (req.user.role === 'client' && mealRecall.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(mealRecall);
  } catch (error) {
    console.error('Error fetching meal recall:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/meal-recalls
// @desc    Create or update meal recall for today
// @access  Private (Client only)
router.post('/', [
  auth,
  body('meals').isArray({ min: 1, max: 15 }).withMessage('Meals must be an array with 1-15 items'),
  body('meals.*.time').notEmpty().withMessage('Time is required for each meal'),
  body('meals.*.description').notEmpty().withMessage('Description is required for each meal'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can create meal recalls' });
    }
    
    const { meals, notes } = req.body;
    
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if meal recall for today already exists
    let mealRecall = await MealRecall.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (mealRecall) {
      // Update existing recall
      mealRecall.meals = meals;
      mealRecall.notes = notes || '';
      mealRecall.isReviewed = false;
      mealRecall.adminFeedback = '';
      await mealRecall.save();
    } else {
      // Create new recall
      mealRecall = new MealRecall({
        user: req.user.id,
        date: today,
        meals,
        notes: notes || ''
      });
      await mealRecall.save();
    }
    
    await mealRecall.populate('user', 'name email');
    res.status(201).json(mealRecall);
  } catch (error) {
    console.error('Error creating/updating meal recall:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/meal-recalls/:id/feedback
// @desc    Add admin feedback and rating to meal recall
// @access  Private (Admin only)
router.put('/:id/feedback', [
  auth,
  body('adminFeedback').notEmpty().withMessage('Admin feedback is required'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can add feedback' });
    }
    
    const { adminFeedback, rating } = req.body;
    
    const mealRecall = await MealRecall.findById(req.params.id);
    if (!mealRecall) {
      return res.status(404).json({ message: 'Meal recall not found' });
    }
    
    mealRecall.adminFeedback = adminFeedback;
    mealRecall.rating = rating || null;
    mealRecall.isReviewed = true;
    await mealRecall.save();
    
    await mealRecall.populate('user', 'name email');
    res.json(mealRecall);
  } catch (error) {
    console.error('Error updating meal recall feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/meal-recalls/:id
// @desc    Delete meal recall
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const mealRecall = await MealRecall.findById(req.params.id);
    
    if (!mealRecall) {
      return res.status(404).json({ message: 'Meal recall not found' });
    }
    
    // Check if user can delete this recall
    if (req.user.role === 'client' && mealRecall.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await MealRecall.findByIdAndDelete(req.params.id);
    res.json({ message: 'Meal recall deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal recall:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
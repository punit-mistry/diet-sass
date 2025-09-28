const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const WeeklyUpdate = require('../models/WeeklyUpdate');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || '../uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'progress-photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   GET /api/updates
// @desc    Get weekly updates
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Clients see their own updates, admins see all updates
    if (req.user.role === 'client') {
      query.user = req.user._id;
    }

    const { userId, page = 1, limit = 10 } = req.query;
    if (userId && req.user.role === 'admin') {
      query.user = userId;
    }

    const updates = await WeeklyUpdate.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WeeklyUpdate.countDocuments(query);

    res.json({
      updates,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get updates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/updates/:id
// @desc    Get weekly update by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const update = await WeeklyUpdate.findById(req.params.id)
      .populate('user', 'name email');

    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }

    // Clients can only view their own updates
    if (req.user.role === 'client' && update.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ update });
  } catch (error) {
    console.error('Get update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/updates
// @desc    Submit weekly update (client only)
// @access  Private/Client
router.post('/', [
  auth,
  upload.single('photo'),
  body('weight').isNumeric().withMessage('Weight must be a number'),
  body('mood').isIn(['excellent', 'good', 'okay', 'poor', 'terrible']).withMessage('Invalid mood value'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can submit weekly updates' });
    }

    const { weight, mood, notes } = req.body;

    // Check if update already exists for this week
    const weekStart = new Date();
    const dayOfWeek = weekStart.getDay();
    const diff = weekStart.getDate() - dayOfWeek;
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    const existingUpdate = await WeeklyUpdate.findOne({
      user: req.user._id,
      weekStartDate: weekStart
    });

    if (existingUpdate) {
      return res.status(400).json({ message: 'Weekly update already submitted for this week' });
    }

    const update = new WeeklyUpdate({
      user: req.user._id,
      weight: parseFloat(weight),
      mood,
      notes,
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
      weekStartDate: weekStart
    });

    await update.save();

    const populatedUpdate = await WeeklyUpdate.findById(update._id)
      .populate('user', 'name email');

    res.status(201).json({
      message: 'Weekly update submitted successfully',
      update: populatedUpdate
    });
  } catch (error) {
    console.error('Submit update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/updates/:id
// @desc    Update weekly update (client only)
// @access  Private/Client
router.put('/:id', [
  auth,
  upload.single('photo'),
  body('weight').optional().isNumeric().withMessage('Weight must be a number'),
  body('mood').optional().isIn(['excellent', 'good', 'okay', 'poor', 'terrible']).withMessage('Invalid mood value'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const update = await WeeklyUpdate.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }

    // Clients can only update their own updates
    if (req.user.role === 'client' && update.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { weight, mood, notes } = req.body;

    if (weight !== undefined) update.weight = parseFloat(weight);
    if (mood) update.mood = mood;
    if (notes !== undefined) update.notes = notes;
    if (req.file) {
      // Delete old photo if exists
      if (update.photoUrl) {
        const oldPhotoPath = path.join(__dirname, '..', '..', update.photoUrl);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      update.photoUrl = `/uploads/${req.file.filename}`;
    }

    await update.save();

    const populatedUpdate = await WeeklyUpdate.findById(update._id)
      .populate('user', 'name email');

    res.json({
      message: 'Update modified successfully',
      update: populatedUpdate
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/updates/:id/feedback
// @desc    Add admin feedback to update
// @access  Private/Admin
router.put('/:id/feedback', [
  auth,
  adminAuth,
  body('feedback').trim().isLength({ min: 1, max: 500 }).withMessage('Feedback is required and must be 1-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const update = await WeeklyUpdate.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }

    const { feedback } = req.body;

    update.adminFeedback = feedback;
    update.isReviewed = true;
    await update.save();

    const populatedUpdate = await WeeklyUpdate.findById(update._id)
      .populate('user', 'name email');

    res.json({
      message: 'Feedback added successfully',
      update: populatedUpdate
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/updates/:id
// @desc    Delete weekly update
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const update = await WeeklyUpdate.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }

    // Clients can only delete their own updates
    if (req.user.role === 'client' && update.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete photo if exists
    if (update.photoUrl) {
      const photoPath = path.join(__dirname, '..', '..', update.photoUrl);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await WeeklyUpdate.findByIdAndDelete(req.params.id);

    res.json({ message: 'Update deleted successfully' });
  } catch (error) {
    console.error('Delete update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notes
// @desc    Get notes for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Clients see notes sent to them, admins see all notes
    if (req.user.role === 'client') {
      query.user = req.user._id;
    }

    const notes = await Note.find(query)
      .populate('user', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notes/:id
// @desc    Get note by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('user', 'name email')
      .populate('createdBy', 'name email');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Clients can only view notes sent to them
    if (req.user.role === 'client' && note.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ note });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notes
// @desc    Create note (admin only)
// @access  Private/Admin
router.post('/', [
  auth,
  adminAuth,
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message is required and must be 1-1000 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, message, priority = 'medium' } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const note = new Note({
      user: userId,
      message,
      priority,
      createdBy: req.user._id
    });

    await note.save();

    const populatedNote = await Note.findById(note._id)
      .populate('user', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Note sent successfully',
      note: populatedNote
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notes/:id/read
// @desc    Mark note as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Clients can only mark their own notes as read
    if (req.user.role === 'client' && note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    note.isRead = true;
    await note.save();

    res.json({ message: 'Note marked as read' });
  } catch (error) {
    console.error('Mark note as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete note (admin only)
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

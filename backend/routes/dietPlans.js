const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const DietPlan = require('../models/DietPlan');
const { auth, adminAuth } = require('../middleware/auth');
const { cloudinary, dietPlanStorage } = require('../config/cloudinary');

const router = express.Router();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: dietPlanStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   GET /api/diet-plans
// @desc    Get diet plans
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = { isActive: true };
    
    // Clients can only see plans assigned to them
    if (req.user.role === 'client') {
      query.assignedUsers = req.user._id;
    }

    const dietPlans = await DietPlan.find(query)
      .populate('assignedUsers', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ dietPlans });
  } catch (error) {
    console.error('Get diet plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/diet-plans/:id
// @desc    Get diet plan by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id)
      .populate('assignedUsers', 'name email')
      .populate('createdBy', 'name email');

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    // Clients can only view plans assigned to them
    if (req.user.role === 'client' && !dietPlan.assignedUsers.some(user => user._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ dietPlan });
  } catch (error) {
    console.error('Get diet plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/diet-plans
// @desc    Create diet plan (admin only)
// @access  Private/Admin
router.post('/', [
  auth,
  adminAuth,
  upload.single('file'),
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be 1-100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('assignedUsers').optional().custom((value) => {
    // Handle both array and JSON string formats
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed);
      } catch (e) {
        return false;
      }
    }
    return Array.isArray(value);
  }).withMessage('Assigned users must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    const { title, description, assignedUsers = [], tags = [] } = req.body;
    
    // Parse assignedUsers if it's a JSON string
    let parsedAssignedUsers = assignedUsers;
    if (typeof assignedUsers === 'string') {
      try {
        parsedAssignedUsers = JSON.parse(assignedUsers);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid assignedUsers format' });
      }
    }

    const dietPlan = new DietPlan({
      title,
      description,
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      assignedUsers: parsedAssignedUsers,
      createdBy: req.user._id,
      tags
    });

    await dietPlan.save();

    const populatedPlan = await DietPlan.findById(dietPlan._id)
      .populate('assignedUsers', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Diet plan created successfully',
      dietPlan: populatedPlan
    });
  } catch (error) {
    console.error('Create diet plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/diet-plans/:id
// @desc    Update diet plan (admin only)
// @access  Private/Admin
router.put('/:id', [
  auth,
  adminAuth,
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('assignedUsers').optional().custom((value) => {
    // Handle both array and JSON string formats
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed);
      } catch (e) {
        return false;
      }
    }
    return Array.isArray(value);
  }).withMessage('Assigned users must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const dietPlan = await DietPlan.findById(req.params.id);
    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    const { title, description, assignedUsers, isActive, tags } = req.body;
    
    // Parse assignedUsers if it's a JSON string
    let parsedAssignedUsers = assignedUsers;
    if (assignedUsers && typeof assignedUsers === 'string') {
      try {
        parsedAssignedUsers = JSON.parse(assignedUsers);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid assignedUsers format' });
      }
    }

    if (title) dietPlan.title = title;
    if (description !== undefined) dietPlan.description = description;
    if (assignedUsers) dietPlan.assignedUsers = parsedAssignedUsers;
    if (isActive !== undefined) dietPlan.isActive = isActive;
    if (tags) dietPlan.tags = tags;

    await dietPlan.save();

    const populatedPlan = await DietPlan.findById(dietPlan._id)
      .populate('assignedUsers', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      message: 'Diet plan updated successfully',
      dietPlan: populatedPlan
    });
  } catch (error) {
    console.error('Update diet plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/diet-plans/:id
// @desc    Delete diet plan (admin only)
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id);
    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    // Delete the file from Cloudinary
    const publicId = dietPlan.fileUrl?.split('/').slice(-2).join('/').replace(/\.[^.]+$/, '');
    if (publicId) {
      try { await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }); } catch {}
    }

    await DietPlan.findByIdAndDelete(req.params.id);

    res.json({ message: 'Diet plan deleted successfully' });
  } catch (error) {
    console.error('Delete diet plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

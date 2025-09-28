const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const DietPlan = require('../models/DietPlan');
const Note = require('../models/Note');
const WeeklyUpdate = require('../models/WeeklyUpdate');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dietience');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await DietPlan.deleteMany({});
    await Note.deleteMany({});
    await WeeklyUpdate.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Dt. Irika Goyal',
      email: 'admin@dietience.com',
      password: 'admin123',
      role: 'admin',
      profileImage: '/profile.jpg'
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create sample clients
    const client1 = new User({
      name: 'John Smith',
      email: 'john@example.com',
      password: 'password123',
      role: 'client'
    });

    const client2 = new User({
      name: 'Emily Davis',
      email: 'emily@example.com',
      password: 'password123',
      role: 'client'
    });

    const client3 = new User({
      name: 'Mike Wilson',
      email: 'mike@example.com',
      password: 'password123',
      role: 'client'
    });

    await Promise.all([client1.save(), client2.save(), client3.save()]);
    console.log('Created sample clients');

    // Create sample diet plans
    const dietPlan1 = new DietPlan({
      title: 'Weight Loss Program - Phase 1',
      description: 'Initial 4-week weight loss program focusing on calorie deficit and balanced nutrition',
      fileUrl: '/uploads/sample-diet-plan-1.pdf',
      fileName: 'Weight Loss Phase 1.pdf',
      fileSize: 1024000,
      assignedUsers: [client1._id, client2._id],
      createdBy: adminUser._id,
      tags: ['weight-loss', 'beginner', '4-weeks']
    });

    const dietPlan2 = new DietPlan({
      title: 'Muscle Building Nutrition Guide',
      description: 'High-protein diet plan for muscle building and strength training',
      fileUrl: '/uploads/sample-diet-plan-2.pdf',
      fileName: 'Muscle Building Guide.pdf',
      fileSize: 2048000,
      assignedUsers: [client3._id],
      createdBy: adminUser._id,
      tags: ['muscle-building', 'high-protein', 'advanced']
    });

    const dietPlan3 = new DietPlan({
      title: 'Maintenance Diet Plan',
      description: 'Balanced diet plan for maintaining current weight and health',
      fileUrl: '/uploads/sample-diet-plan-3.pdf',
      fileName: 'Maintenance Plan.pdf',
      fileSize: 1536000,
      assignedUsers: [client1._id, client2._id, client3._id],
      createdBy: adminUser._id,
      tags: ['maintenance', 'balanced', 'long-term']
    });

    await Promise.all([dietPlan1.save(), dietPlan2.save(), dietPlan3.save()]);
    console.log('Created sample diet plans');

    // Create sample notes
    const note1 = new Note({
      user: client1._id,
      message: 'Great progress this week! Keep up the excellent work with your meal prep. Remember to stay hydrated.',
      createdBy: adminUser._id,
      priority: 'medium'
    });

    const note2 = new Note({
      user: client2._id,
      message: 'I noticed you missed a few meals this week. Let\'s schedule a call to discuss meal planning strategies.',
      createdBy: adminUser._id,
      priority: 'high'
    });

    const note3 = new Note({
      user: client3._id,
      message: 'Your protein intake looks good! Consider adding more complex carbs for better energy levels.',
      createdBy: adminUser._id,
      priority: 'low'
    });

    await Promise.all([note1.save(), note2.save(), note3.save()]);
    console.log('Created sample notes');

    // Create sample weekly updates
    const update1 = new WeeklyUpdate({
      user: client1._id,
      weight: 75.5,
      mood: 'good',
      notes: 'Feeling more energetic this week. Stuck to the meal plan most days.',
      weekStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
    });

    const update2 = new WeeklyUpdate({
      user: client2._id,
      weight: 68.2,
      mood: 'okay',
      notes: 'Had some challenges with meal prep this week. Need to plan better.',
      weekStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });

    const update3 = new WeeklyUpdate({
      user: client3._id,
      weight: 82.1,
      mood: 'excellent',
      notes: 'Great week! Increased my protein intake and feeling stronger.',
      weekStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      adminFeedback: 'Excellent work! Your consistency is paying off. Keep it up!',
      isReviewed: true
    });

    await Promise.all([update1.save(), update2.save(), update3.save()]);
    console.log('Created sample weekly updates');

    console.log('Database seeded successfully!');
    console.log('\nSample accounts:');
    console.log('Admin: admin@dietience.com / admin123');
    console.log('Client 1: john@example.com / password123');
    console.log('Client 2: emily@example.com / password123');
    console.log('Client 3: mike@example.com / password123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedData();

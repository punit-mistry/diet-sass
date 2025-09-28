const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

async function createAdmin() {
  try {
    console.log('Starting admin creation script...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dietience');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@dietience.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      console.log('Created at:', existingAdmin.createdAt);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@dietience.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });

    // Save admin user (password will be hashed automatically by the pre-save middleware)
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@dietience.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('Created at:', adminUser.createdAt);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the script
createAdmin();

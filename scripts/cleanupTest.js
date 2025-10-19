const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
require('dotenv').config();

async function cleanupTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mits-canteen');
    console.log('Connected to MongoDB');

    // Remove test users and their orders
    const testUsers = await User.find({ 
      email: { $in: ['teststudent@example.com', 'teststaff@example.com'] }
    });

    for (const user of testUsers) {
      await Order.deleteMany({ user: user._id });
      await User.findByIdAndDelete(user._id);
      console.log(`Deleted test user: ${user.name}`);
    }

    console.log('Cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

cleanupTestData();
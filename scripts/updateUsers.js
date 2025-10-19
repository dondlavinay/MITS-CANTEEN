const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function updateExistingUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mits-canteen');
    console.log('Connected to MongoDB');

    // Find users without role field
    const usersWithoutRole = await User.find({ 
      $or: [
        { role: { $exists: false } },
        { role: null },
        { role: '' }
      ]
    });

    console.log(`Found ${usersWithoutRole.length} users without role`);

    for (const user of usersWithoutRole) {
      // Set default role as Student and generate a default student ID
      user.role = 'Student';
      user.studentId = `STU${Date.now()}${Math.floor(Math.random() * 1000)}`;
      await user.save();
      console.log(`Updated user ${user.name} with role: ${user.role}, studentId: ${user.studentId}`);
    }

    console.log('Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

updateExistingUsers();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function checkCanteenEmail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const admins = await Admin.find({}, 'name email');
    console.log('All canteen accounts:');
    admins.forEach(admin => {
      console.log(`Name: ${admin.name}, Email: ${admin.email}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkCanteenEmail();
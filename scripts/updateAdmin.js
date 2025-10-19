const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function updateAdminProfile() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find admin by canteen name or email
    const canteenName = 'MITS Canteen'; // Change this to your canteen name
    const admin = await Admin.findOne({ name: canteenName });
    
    if (!admin) {
      console.log('Admin not found');
      return;
    }
    
    // Update profile fields
    admin.name = 'Updated Canteen Name';
    admin.email = 'updated@email.com';
    admin.phone = '9876543210';
    admin.address = 'Updated Address';
    // admin.canteenPhoto = 'path/to/new/photo.jpg';
    
    await admin.save();
    console.log('Admin profile updated successfully');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

updateAdminProfile();
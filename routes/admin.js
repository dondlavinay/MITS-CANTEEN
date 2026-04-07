const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');
const router = express.Router();
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, address, canteenId, canteenPhoto, password } = req.body;

    if (!name || !email || !phone || !address || !canteenId || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = new Admin({ name, email, phone, address, canteenId, canteenPhoto, password });
    await admin.save();

    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: admin._id, name: admin.name, email: admin.email, phone: admin.phone, address: admin.address, canteenId: admin.canteenId, canteenPhoto: admin.canteenPhoto, role: 'admin' }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { canteenName, password } = req.body;

    if (!canteenName || !password) {
      return res.status(400).json({ message: 'Canteen name and password are required' });
    }

    const admin = await Admin.findOne({ name: canteenName });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: admin._id, name: admin.name, email: admin.email, phone: admin.phone, address: admin.address, canteenId: admin.canteenId, canteenPhoto: admin.canteenPhoto, role: 'admin' }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Admin Profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone, address, canteenPhoto } = req.body;
    
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;
    if (address) admin.address = address;
    if (canteenPhoto) admin.canteenPhoto = canteenPhoto;
    
    await admin.save();
    
    res.json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      address: admin.address,
      canteenId: admin.canteenId,
      canteenPhoto: admin.canteenPhoto,
      role: 'admin'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
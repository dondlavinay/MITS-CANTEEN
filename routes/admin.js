const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();
const otpStore = new Map();

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Send OTP for admin
router.post('/send-otp', async (req, res) => {
  try {
    const { canteenName } = req.body;
    const admin = await Admin.findOne({ name: canteenName });
    
    if (!admin) {
      return res.status(404).json({ message: 'Canteen not found' });
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(admin.email, { otp, expires: Date.now() + 300000 });
    
    try {
      // Try to send email
      console.log('Attempting to send email to:', admin.email);
      console.log('Using email user:', process.env.EMAIL_USER);
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: admin.email,
        subject: 'MITS Canteen Login OTP',
        text: `Your OTP for canteen login is: ${otp}. Valid for 5 minutes.`
      });
      
      console.log('Email sent successfully');
      res.json({ message: 'OTP sent to registered email' });
    } catch (emailError) {
      console.error('Email error:', emailError.message);
      // Fallback: return OTP in response
      res.json({ message: 'Email failed. Your OTP is', otp });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Admin Register
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
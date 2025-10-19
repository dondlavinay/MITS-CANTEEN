const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
const otpStore = new Map();

// Send OTP
router.post('/send-otp', (req, res) => {
  const { email, phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email || phone, { otp, expires: Date.now() + 300000 });
  res.json({ message: 'OTP sent successfully', otp }); // Remove otp in production
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, role, studentId, staffId, password } = req.body;

    if (!name || !email || !phone || !role || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name, email, phone, role, password,
      ...(role === 'Student' && { studentId }),
      ...(role === 'Staff' && { staffId })
    });

    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone,
        role: user.role,
        studentId: user.studentId,
        staffId: user.staffId
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role, studentId, staffId } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password and role are required' });
    }

    if (role === 'Student' && !studentId) {
      return res.status(400).json({ message: 'Student ID is required for students' });
    }

    if (role === 'Staff' && !staffId) {
      return res.status(400).json({ message: 'Staff ID is required for staff' });
    }

    // Find user by email and role
    const query = { email, role };
    if (role === 'Student') {
      query.studentId = studentId;
    } else {
      query.staffId = staffId;
    }

    const user = await User.findOne(query);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone,
        role: user.role,
        studentId: user.studentId,
        staffId: user.staffId
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: { 
      id: req.user._id, 
      name: req.user.name, 
      email: req.user.email, 
      phone: req.user.phone,
      role: req.user.role,
      studentId: req.user.studentId,
      staffId: req.user.staffId
    }
  });
});

// Get all users (admin only)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role studentId staffId');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
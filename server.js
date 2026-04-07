const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Ensure JWT_SECRET is available
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET not found in environment variables. Using fallback.');
  process.env.JWT_SECRET = 'fallback-jwt-secret-key-for-development-only';
}

const app = express();
const server = http.createServer(app);
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Admin = require('./models/Admin');

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO auth middleware - verify JWT on handshake
io.use(async (socket, next) => {
  try {
    // token may be sent in auth payload or query
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication error: token required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id).select('-password');
      user.role = 'admin';
    } else {
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user) return next(new Error('Authentication error: user not found'));

    // attach user to socket for later use
    socket.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.log('Socket JWT expired, user needs to re-login');
      next(new Error('Token expired'));
    } else {
      console.error('Socket auth error:', err.message || err);
      next(new Error('Authentication error'));
    }
  }
});
const PORT = process.env.PORT || 3002;

// Make io available globally
app.set('io', io);

// Middleware
app.use(cors({
  origin: ['https://dondlavinay.github.io', 'http://localhost:3000', 'http://localhost:3002', 'http://localhost:3005', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('docs'));
app.use('/uploads', express.static('docs/uploads'));

// MongoDB Connection
let isDbConnected = false;

const connectDB = async () => {
  const connectionOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    family: 4, // Force IPv4
    retryWrites: true,
    retryReads: true
  };

  try {
    // Try SRV connection first
    await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    console.log('✅ Connected to MongoDB Atlas via SRV');
    isDbConnected = true;
  } catch (srvErr) {
    console.error('❌ SRV connection failed:', srvErr.message);
    
    try {
      // Fallback to direct connection
      const fallbackUri = 'mongodb://ac-xojwtsg-shard-00-00.6g88xva.mongodb.net:27017,ac-xojwtsg-shard-00-01.6g88xva.mongodb.net:27017,ac-xojwtsg-shard-00-02.6g88xva.mongodb.net:27017/canteen-db?ssl=true&replicaSet=atlas-14hdqp-shard-0&authSource=admin&retryWrites=true&w=majority';
      await mongoose.connect(fallbackUri.replace('mongodb://', `mongodb://vinay:vinay123@`), connectionOptions);
      console.log('✅ Connected to MongoDB Atlas via direct connection');
      isDbConnected = true;
    } catch (directErr) {
      console.error('❌ Direct connection also failed:', directErr.message);
      isDbConnected = false;
      // Retry connection after 15 seconds
      setTimeout(connectDB, 15000);
    }
  }
};

connectDB();

// MongoDB connection status monitoring
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
  isDbConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
  isDbConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
  isDbConnected = false;
  // Attempt to reconnect
  setTimeout(connectDB, 15000);
});

// Global error handler
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/orders', require('./routes/orders'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: isDbConnected ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'MITS Canteen API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      menu: '/api/menu',
      orders: '/api/orders',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🔄 Real-time updates enabled`);
  console.log('📋 Registered routes:');
  console.log('  - /api/orders (with rating endpoint)');
});

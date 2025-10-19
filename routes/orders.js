const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    // Extra safety: ensure auth middleware set req.user
    if (!req.user) {
      console.warn('Unauthorized order creation attempt: no user on request');
      return res.status(401).json({ message: 'Authentication required' });
    }
    const { items, deliveryAddress, deliveryTime, paymentMethod, paymentDetails } = req.body;
    
    // Check UTR ID uniqueness for UPI payments
    if (paymentMethod === 'UPI' && paymentDetails && paymentDetails.trim()) {
      console.log('Checking UTR ID:', paymentDetails);
      const existingOrder = await Order.findOne({ paymentDetails: paymentDetails.trim() });
      if (existingOrder) {
        console.log('Duplicate UTR ID found:', paymentDetails);
        return res.status(400).json({ message: 'UTR ID already used' });
      }
    }
    
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item not found: ${item.menuItem}` });
      }
      
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItem.price
      });
    }

    const deliveryCharge = 20;
    const finalTotal = totalAmount + deliveryCharge;

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      subtotal: totalAmount,
      deliveryCharge: deliveryCharge,
      totalAmount: finalTotal,
      deliveryAddress,
      deliveryTime,
      paymentMethod,
      paymentDetails
    });

    await order.save();
    await order.populate('items.menuItem');
    await order.populate('user', 'name email role studentId staffId');
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('newOrder', order);
    
    res.status(201).json(order);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.paymentDetails) {
      return res.status(400).json({ message: 'UTR ID already used' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.menuItem')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin)
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email role studentId staffId')
      .populate('items.menuItem')
      .sort({ createdAt: -1 });
    
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    ).populate('items.menuItem')
     .populate('user', 'name email role studentId staffId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('orderStatusUpdated', order);
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check UTR ID existence
router.post('/check-utr', auth, async (req, res) => {
  try {
    const { utrId } = req.body;
    const existingOrder = await Order.findOne({ paymentDetails: utrId });
    res.json({ exists: !!existingOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel order
// Cancel order (user, only if pending)
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // User can only cancel their own pending order
    if (order.user.toString() === req.user._id.toString() && order.status === 'pending') {
      order.status = 'cancelled';
      await order.save();
      // Emit real-time update
      const io = req.app.get('io');
      io.emit('orderCancelled', { id: req.params.id, status: 'cancelled' });
      return res.json({ message: 'Order cancelled successfully' });
    }
    // Admin/canteen or user can hard delete delivered order
    if ((req.user.role === 'admin' || order.user.toString() === req.user._id.toString()) && order.status === 'delivered') {
      await Order.findByIdAndDelete(req.params.id);
      // Emit real-time update
      const io = req.app.get('io');
      io.emit('orderRemoved', { id: req.params.id });
      return res.json({ message: 'Order removed successfully' });
    }
    return res.status(403).json({ message: 'Not authorized or order not delivered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
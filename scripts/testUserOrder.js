const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
require('dotenv').config();

async function testUserOrder() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mits-canteen');
    console.log('Connected to MongoDB');

    // Create a test student user
    const testStudent = new User({
      name: 'Test Student',
      email: 'teststudent@example.com',
      phone: '1234567890',
      role: 'Student',
      studentId: 'STU2025001',
      password: 'password123'
    });

    await testStudent.save();
    console.log('Created test student:', testStudent);

    // Create a test staff user
    const testStaff = new User({
      name: 'Test Staff',
      email: 'teststaff@example.com',
      phone: '0987654321',
      role: 'Staff',
      staffId: 'STAFF2025001',
      password: 'password123'
    });

    await testStaff.save();
    console.log('Created test staff:', testStaff);

    // Find a menu item to create orders
    const menuItem = await MenuItem.findOne();
    if (menuItem) {
      // Create test order for student
      const studentOrder = new Order({
        user: testStudent._id,
        items: [{
          menuItem: menuItem._id,
          quantity: 2,
          price: menuItem.price
        }],
        totalAmount: menuItem.price * 2,
        deliveryAddress: 'Room 101',
        deliveryTime: '12:00 PM',
        paymentMethod: 'Cash on Delivery'
      });

      await studentOrder.save();
      console.log('Created student order');

      // Create test order for staff
      const staffOrder = new Order({
        user: testStaff._id,
        items: [{
          menuItem: menuItem._id,
          quantity: 1,
          price: menuItem.price
        }],
        totalAmount: menuItem.price,
        deliveryAddress: 'Office 201',
        deliveryTime: '1:00 PM',
        paymentMethod: 'UPI'
      });

      await staffOrder.save();
      console.log('Created staff order');

      // Test the populate query
      const orders = await Order.find()
        .populate('user', 'name email role studentId staffId')
        .populate('items.menuItem')
        .sort({ createdAt: -1 });

      console.log('Orders with populated user data:');
      orders.forEach(order => {
        console.log(`Order ID: ${order._id}`);
        console.log(`User: ${order.user.name} (${order.user.role})`);
        console.log(`Register: ${order.user.role === 'Student' ? order.user.studentId : order.user.staffId}`);
        console.log('---');
      });
    }

    console.log('Test completed');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testUserOrder();
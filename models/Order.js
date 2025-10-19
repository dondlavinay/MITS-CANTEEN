const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true, min: 0 },
  deliveryCharge: { type: Number, default: 20 },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'], default: 'pending' },
  deliveryAddress: { type: String },
  deliveryTime: { type: String },
  paymentMethod: { type: String, enum: ['Cash on Delivery', 'UPI'], default: 'Cash on Delivery' },
  paymentDetails: { type: String, unique: true, sparse: true, validate: { validator: function(v) { return !v || /^[A-Za-z0-9]{12}$/.test(v); }, message: 'UTR ID must be 12 alphanumeric characters' } },
  orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
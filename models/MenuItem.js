const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['snacks', 'veg', 'nonveg', 'icecream', 'juice', 'starters'] },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  description: { type: String, trim: true },
  available: { type: Boolean, default: true },
  stock: { type: Number, default: 50 }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
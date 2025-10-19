const express = require('express');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category, available: true } : { available: true };
    const menuItems = await MenuItem.find(filter);
    res.json(menuItems);
  } catch (error) {
    console.error('Menu fetch error:', error.message);
    if (error.name === 'MongooseError' || error.message.includes('buffering')) {
      return res.status(503).json({ 
        message: 'Database connection unavailable. Please try again later.',
        items: []
      });
    }
    res.status(500).json({ message: error.message, items: [] });
  }
});

// Get menu item by ID
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add menu item
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, price, image, description } = req.body;
    
    const menuItem = new MenuItem({ name, category, price, image, description });
    await menuItem.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('menuItemAdded', menuItem);
    
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update menu item
router.put('/:id', auth, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('menuItemUpdated', menuItem);
    
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete menu item
router.delete('/:id', auth, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('menuItemDeleted', { id: req.params.id });
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear all menu items (admin only)
router.delete('/clear-all', auth, async (req, res) => {
  try {
    const result = await MenuItem.deleteMany({});
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('menuCleared', { deletedCount: result.deletedCount });
    
    res.json({ 
      message: `Successfully cleared ${result.deletedCount} menu items`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Calculate order total
router.post('/calculate-total', async (req, res) => {
  try {
    const { items } = req.body; // items: [{ name: 'itemName', quantity: 2 }]
    
    let total = 0;
    const calculatedItems = [];
    
    for (const item of items) {
      const menuItem = await MenuItem.findOne({ name: item.name, available: true });
      if (menuItem) {
        const itemTotal = menuItem.price * item.quantity;
        total += itemTotal;
        calculatedItems.push({
          name: menuItem.name,
          price: menuItem.price,
          quantity: item.quantity,
          total: itemTotal
        });
      }
    }
    
    res.json({
      items: calculatedItems,
      subtotal: total,
      deliveryCharge: 20,
      total: total + 20
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
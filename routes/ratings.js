const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MenuItem = require('../models/MenuItem');

router.get('/:itemId', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.itemId).select('averageRating totalRatings ratings');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

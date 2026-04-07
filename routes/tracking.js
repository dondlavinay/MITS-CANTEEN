const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/:orderId', auth, (req, res) => {
  res.json({ orderId: req.params.orderId, status: 'tracking not available' });
});

module.exports = router;

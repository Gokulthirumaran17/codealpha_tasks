const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

router.get('/', cartController.getCart);
router.post('/', cartController.addItem);
router.put('/:productId', cartController.updateItem);
router.delete('/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;

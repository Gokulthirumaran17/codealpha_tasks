const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const requireAuth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.use(requireAuth);

router.post('/', orderController.createOrder);
router.get('/', orderController.myOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/status', adminOnly, orderController.updateStatus);

module.exports = router;

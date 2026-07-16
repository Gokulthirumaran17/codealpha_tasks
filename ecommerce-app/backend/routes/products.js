const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const requireAuth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/', productController.list);
router.get('/categories', productController.categories);
router.get('/:id', productController.getOne);

router.post('/', requireAuth, adminOnly, productController.create);
router.put('/:id', requireAuth, adminOnly, productController.update);
router.delete('/:id', requireAuth, adminOnly, productController.remove);

module.exports = router;

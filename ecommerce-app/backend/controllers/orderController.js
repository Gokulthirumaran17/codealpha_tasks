const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Note: this uses sequential writes rather than a MongoDB multi-document
// transaction, so it works against a standalone MongoDB instance (no
// replica set required). That's the right tradeoff for a basic/demo app;
// a production system handling real payments should use transactions.
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    if (!shippingAddress) {
      return res.status(400).json({ message: 'shippingAddress is required.' });
    }
    const required = ['fullName', 'line1', 'city', 'state', 'postalCode', 'country'];
    for (const field of required) {
      if (!shippingAddress[field]) {
        return res.status(400).json({ message: `shippingAddress.${field} is required.` });
      }
    }

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Verify stock for every item before changing anything
    for (const item of cart.items) {
      if (!item.product || item.product.stockQuantity < item.quantity) {
        const name = item.product ? item.product.name : 'an item';
        return res.status(400).json({ message: `Not enough stock for "${name}".` });
      }
    }

    // Decrement stock and build order line items
    const orderItems = [];
    for (const item of cart.items) {
      item.product.stockQuantity -= item.quantity;
      await item.product.save();

      orderItems.push({
        product: item.product._id,
        name: item.product.name,
        price: item.priceAtAdd,
        quantity: item.quantity,
      });
    }

    const totalAmount = Number(
      orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)
    );

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: 'paid', // simplified: assume payment succeeds immediately
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({ order });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not place order.' });
  }
};

exports.myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Could not load orders.', error: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const isOwner = order.user.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order.' });
    }

    res.json({ order });
  } catch (err) {
    res.status(400).json({ message: 'Invalid order id.', error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Could not update order status.', error: err.message });
  }
};

const Cart = require('../models/Cart');
const Product = require('../models/Product');

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

function serializeCart(cart) {
  const items = cart.items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
    priceAtAdd: item.priceAtAdd,
    lineTotal: Number((item.priceAtAdd * item.quantity).toFixed(2)),
  }));
  const total = Number(items.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2));
  return { id: cart._id, items, total };
}

exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    await cart.populate('items.product');
    res.json(serializeCart(cart));
  } catch (err) {
    res.status(500).json({ message: 'Could not load cart.', error: err.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required.' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock available.' });
    }

    const cart = await getOrCreateCart(req.user.id);
    const existing = cart.items.find((i) => i.product.toString() === productId);

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity, priceAtAdd: product.price });
    }

    await cart.save();
    await cart.populate('items.product');
    res.status(201).json(serializeCart(cart));
  } catch (err) {
    res.status(500).json({ message: 'Could not add item to cart.', error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity == null || quantity < 1) {
      return res.status(400).json({ message: 'quantity must be at least 1.' });
    }

    const cart = await getOrCreateCart(req.user.id);
    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart.' });

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');
    res.json(serializeCart(cart));
  } catch (err) {
    res.status(500).json({ message: 'Could not update cart item.', error: err.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    await cart.populate('items.product');
    res.json(serializeCart(cart));
  } catch (err) {
    res.status(500).json({ message: 'Could not remove cart item.', error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    await cart.save();
    res.json(serializeCart(cart));
  } catch (err) {
    res.status(500).json({ message: 'Could not clear cart.', error: err.message });
  }
};

const Product = require('../models/Product');

exports.list = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);

    const [items, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      totalPages: Math.max(Math.ceil(total / limitNum), 1),
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not load products.', error: err.message });
  }
};

exports.categories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Could not load categories.', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ product });
  } catch (err) {
    res.status(400).json({ message: 'Invalid product id.', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stockQuantity } = req.body;
    if (!name || !description || price == null || !category) {
      return res.status(400).json({ message: 'name, description, price and category are required.' });
    }
    const product = await Product.create({
      name,
      description,
      price,
      category,
      imageUrl: imageUrl || '',
      stockQuantity: stockQuantity ?? 0,
    });
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Could not create product.', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Could not update product.', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete product.', error: err.message });
  }
};

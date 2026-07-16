require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const products = [
  {
    name: 'Ridgeline Waterproof Jacket',
    description: 'A 3-layer waterproof shell built for wet trails and sudden weather changes. Fully seam-sealed with pit zips for ventilation.',
    price: 189.0,
    category: 'Apparel',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',
    stockQuantity: 24,
  },
  {
    name: 'Summit 40L Backpack',
    description: 'A trail-ready 40 liter pack with a ventilated back panel, hydration sleeve, and adjustable torso length.',
    price: 145.0,
    category: 'Gear',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    stockQuantity: 15,
  },
  {
    name: 'Alpine Merino Base Layer',
    description: 'Odor-resistant merino wool base layer that regulates temperature in both cold starts and warm afternoons.',
    price: 68.0,
    category: 'Apparel',
    imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
    stockQuantity: 40,
  },
  {
    name: 'Trailhead Titanium Cookset',
    description: 'Ultralight titanium pot and pan set that nests together for compact packing on multi-day trips.',
    price: 54.0,
    category: 'Camp',
    imageUrl: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600',
    stockQuantity: 30,
  },
  {
    name: 'Contour 2-Person Tent',
    description: 'A freestanding 3-season tent with a full-coverage rainfly and two vestibules for gear storage.',
    price: 249.0,
    category: 'Camp',
    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600',
    stockQuantity: 10,
  },
  {
    name: 'Traverse Trekking Poles (Pair)',
    description: 'Adjustable carbon-fiber trekking poles with cork grips and quick-lock height adjustment.',
    price: 79.0,
    category: 'Gear',
    imageUrl: 'https://images.unsplash.com/photo-1516934024742-b461fba47600?w=600',
    stockQuantity: 22,
  },
  {
    name: 'Basecamp Headlamp',
    description: 'A 350-lumen rechargeable headlamp with a red night-vision mode and adjustable beam.',
    price: 39.0,
    category: 'Gear',
    imageUrl: 'https://images.unsplash.com/photo-1520095972714-909e91b038e5?w=600',
    stockQuantity: 50,
  },
  {
    name: 'Insulated Trail Bottle 1L',
    description: 'Double-wall insulated stainless bottle that keeps water cold for 24 hours on long, hot climbs.',
    price: 34.0,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
    stockQuantity: 60,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Inserted ${products.length} products.`);

  const adminEmail = 'admin@trailmark.test';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({ name: 'Store Admin', email: adminEmail, role: 'admin' });
    await admin.setPassword('admin123');
    await admin.save();
    console.log(`Created admin user: ${adminEmail} / admin123`);
  } else {
    console.log('Admin user already exists, skipping.');
  }

  await mongoose.disconnect();
  console.log('Seeding complete.');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

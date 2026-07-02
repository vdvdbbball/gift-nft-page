const express = require('express');
const { verifyAdmin } = require('../middleware/auth');
const { productValidation } = require('../middleware/validation');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');
const Setting = require('../models/Setting');

const router = express.Router();

router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const orderStats = await Order.getOrderStats();
    const userStats = await User.getUserStats();
    res.json({
      orders: orderStats,
      users: userStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/products', verifyAdmin, productValidation, async (req, res) => {
  try {
    const result = await Product.createProduct(req.body);
    res.status(201).json({ id: result.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/products/:id', verifyAdmin, async (req, res) => {
  try {
    await Product.updateProduct(req.params.id, req.body);
    res.json({ message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/products/:id', verifyAdmin, async (req, res) => {
  try {
    await Product.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/products/:id/toggle', verifyAdmin, async (req, res) => {
  try {
    const { is_active } = req.body;
    await Product.toggleProductActive(req.params.id, is_active);
    res.json({ message: `Product ${is_active ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/products/reorder', verifyAdmin, async (req, res) => {
  try {
    await Product.reorderProducts(req.body.products);
    res.json({ message: 'Products reordered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/settings', verifyAdmin, async (req, res) => {
  try {
    const settings = await Setting.getAllSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings/:key', verifyAdmin, async (req, res) => {
  try {
    const { value, type, description } = req.body;
    await Setting.setSetting(req.params.key, value, type, description);
    res.json({ message: 'Setting updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/products/all', verifyAdmin, async (req, res) => {
  try {
    const products = await Product.getAllProductsAdmin(true);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

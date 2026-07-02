const express = require('express');
const { verifyToken } = require('../middleware/auth');
const Product = require('../models/Product');
const Category = require('../models/Category');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/category/:categoryId', async (req, res) => {
  try {
    const products = await Product.getProductsByCategory(req.params.categoryId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

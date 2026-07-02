const express = require('express');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const User = require('../models/User');

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  try {
    const { product_id, quantity, currency, payment_method } = req.body;

    const product = await Product.getProductById(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const price_uah = currency === 'TON' ? product.price_ton : product.price_uah;
    const price_ton = currency === 'TON' ? product.price_ton : 0;

    const orderResult = await Order.createOrder(req.user.id, product_id, {
      quantity: quantity || 1,
      price_uah,
      price_ton,
      currency: currency || 'UAH',
      payment_method: payment_method || 'manual'
    });

    const orderId = orderResult.id;

    await Payment.createPayment(
      orderId,
      req.user.id,
      currency === 'TON' ? product.price_ton : product.price_uah,
      currency || 'UAH',
      payment_method || 'manual'
    );

    res.status(201).json({
      order_id: orderId,
      product_id,
      quantity,
      price: currency === 'TON' ? product.price_ton : product.price_uah,
      currency: currency || 'UAH'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.getOrdersByUser(req.params.userId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const orders = await Order.getAllOrders(limit, offset);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    await Order.updateOrderStatus(req.params.id, status, notes);
    res.json({ message: `Order status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/stats', verifyAdmin, async (req, res) => {
  try {
    const stats = await Order.getOrderStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

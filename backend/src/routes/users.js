const express = require('express');
const { verifyAdmin } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;
    const users = await User.getAllUsers(limit, offset);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/stats', verifyAdmin, async (req, res) => {
  try {
    const stats = await User.getUserStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:telegramId', async (req, res) => {
  try {
    const user = await User.getUserByTelegramId(req.params.telegramId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { telegram_id, username, first_name, last_name, language_code } = req.body;

    let user = await User.getUserByTelegramId(telegram_id);
    if (user) {
      await User.updateUserLastSeen(user.id);
      return res.json(user);
    }

    const result = await User.createUser(telegram_id, {
      username,
      first_name,
      last_name,
      language_code: language_code || 'uk'
    });

    res.status(201).json({
      id: result.id,
      telegram_id,
      username,
      first_name,
      last_name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await User.updateUser(req.params.id, req.body);
    res.json({ message: 'User updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

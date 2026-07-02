const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { verifyAdmin } = require('../middleware/auth');
const { loginValidation } = require('../middleware/validation');
const Admin = require('../models/Admin');

const router = express.Router();

router.post('/login', loginValidation, async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.getAdminByUsername(username);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await Admin.updateAdminLastLogin(admin.id);

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', verifyAdmin, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/verify', verifyAdmin, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;

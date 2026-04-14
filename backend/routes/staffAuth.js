const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Staff = require('../models/Staff');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

  try {
    if (mongoose.connection.readyState !== 1) {
      if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign({ userId: 'mock-admin', username: 'admin', role: 'admin', bakeryId: null }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
        return res.json({ token, user: { username: 'admin', role: 'admin', bakeryId: null }});
      }
      if (username === 'baker' && password === 'baker123') {
        const token = jwt.sign({ userId: 'mock-baker', username: 'baker', role: 'baker', bakeryId: null }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
        return res.json({ token, user: { username: 'baker', role: 'baker', bakeryId: null }});
      }
      return res.status(401).json({ error: 'DB Offline. Use admin/admin123 or baker/baker123' });
    }

    const user = await Staff.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role, bakeryId: user.bakeryId },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '1d' }
    );

    res.json({ token, user: { username: user.username, role: user.role, bakeryId: user.bakeryId } });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;

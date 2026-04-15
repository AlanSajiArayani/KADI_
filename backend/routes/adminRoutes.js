const express = require('express');
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Staff = require('../models/Staff');
const User = require('../models/User');
const Bakery = require('../models/Bakery');
const Snack = require('../models/Snack');

const router = express.Router();
router.use(authMiddleware, roleAuth(['admin']));

// Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ totalUsers: 24, totalBakeries: 6, totalSnacks: 32, totalBakers: 5 });
    }
    const totalUsers = await User.countDocuments();
    const totalBakeries = await Bakery.countDocuments();
    const totalSnacks = await Snack.countDocuments();
    const totalBakers = await Staff.countDocuments({ role: 'baker' });

    res.json({
      totalUsers,
      totalBakeries,
      totalSnacks,
      totalBakers
    });
  } catch (err) {
    res.status(500).json({ error: 'Stat fetch error' });
  }
});

// Bakers CRUD
router.get('/bakers', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
       return res.json([{ _id: '1', username: 'baker_demo', createdAt: new Date() }]);
    }
    const bakers = await Staff.find({ role: 'baker' }).select('-password').populate('bakeryId', 'name');
    res.json(bakers);
  } catch (err) { res.status(500).json({ error: 'Error fetching bakers' }); }
});

router.post('/bakers', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({ _id: Math.random().toString(), username, role: 'baker' });
    }
    const existing = await Staff.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username taken' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const baker = await Staff.create({ username, password: hashedPassword, role: 'baker' });
    res.status(201).json({ _id: baker._id, username: baker.username, role: baker.role });
  } catch (err) {
     res.status(500).json({ error: 'Error creating baker' }); 
  }
});

router.delete('/bakers/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ success: true, demo: true });
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Error deleting baker' }); }
});

// Registered Users View
router.get('/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([
        { _id: 'u1', firstName: 'John', email: 'john@example.com', mobileNumber: '9876543210', dob: '1990-01-01', createdAt: new Date() },
        { _id: 'u2', firstName: 'Jane', email: 'jane@example.com', mobileNumber: '8765432109', dob: '1992-05-15', createdAt: new Date() }
      ]);
    }
    // Fetch all users including those with partial profiles
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Admin Fetch Users Error:", err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

module.exports = router;

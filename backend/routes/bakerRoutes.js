const express = require('express');
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const mongoose = require('mongoose');
const Staff = require('../models/Staff');
const Bakery = require('../models/Bakery');
const Snack = require('../models/Snack');

const router = express.Router();
router.use(authMiddleware, roleAuth(['baker']));

// Manage Bakery Profile
router.get('/bakery', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ _id: 'mock-bakery', name: 'Mock Liquid Bakery', location: { lat: 37.77, lng: -122.41 }, description: 'Offline preview' });
    }
    const bakery = await Bakery.findOne({ bakerId: req.user.userId });
    if (!bakery) {
      return res.json(null); // Needs to create one
    }
    res.json(bakery);
  } catch (err) { res.status(500).json({ error: 'Error fetching bakery' }); }
});

router.post('/bakery', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ _id: 'mock-bakery', ...req.body });
    const { name, description, lat, lng, image } = req.body;
    
    // Create new bakery
    const bakery = await Bakery.create({
      name, description, location: { lat, lng }, images: image ? [image] : [], bakerId: req.user.userId
    });

    // Link bakery to Baker account
    await Staff.findByIdAndUpdate(req.user.userId, { bakeryId: bakery._id });

    // In a real app we would issue a new JWT containing the bakeryId, 
    // but the frontend context can be updated safely as well.
    res.json(bakery);
  } catch (err) { res.status(500).json({ error: 'Error creating bakery' }); }
});

router.put('/bakery', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ _id: 'mock-bakery', ...req.body });
    const { name, description, lat, lng, image } = req.body;
    const bakery = await Bakery.findOneAndUpdate({ bakerId: req.user.userId }, {
      name, description, location: { lat, lng }, images: image ? [image] : []
    }, { new: true });
    
    res.json(bakery);
  } catch (err) { res.status(500).json({ error: 'Error updating bakery' }); }
});

// Manage Snacks Menu
router.get('/snacks', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json([{ _id: '1', title: 'Offline Donut', price: 2.50, quantity: 10, category: 'Sweet' }]);
  }
  try {
    const bakery = await Bakery.findOne({ bakerId: req.user.userId });
    if (!bakery) return res.json([]);
    const snacks = await Snack.find({ bakeryId: bakery._id });
    res.json(snacks);
  } catch (err) { res.status(500).json({ error: 'Error fetching menu' }); }
});

router.post('/snacks', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(201).json({ _id: Math.random().toString(), ...req.body });
    const bakery = await Bakery.findOne({ bakerId: req.user.userId });
    if (!bakery) return res.status(400).json({ error: 'Setup bakery first' });
    const snackData = { ...req.body, bakeryId: bakery._id };
    const snack = await Snack.create(snackData);
    res.status(201).json(snack);
  } catch (err) { res.status(500).json({ error: 'Error creating snack' }); }
});

router.put('/snacks/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ _id: req.params.id, ...req.body });
    const bakery = await Bakery.findOne({ bakerId: req.user.userId });
    if (!bakery) return res.status(400).json({ error: 'Setup bakery first' });
    const snack = await Snack.findOneAndUpdate(
      { _id: req.params.id, bakeryId: bakery._id }, 
      req.body, 
      { new: true }
    );
    res.json(snack);
  } catch (err) { res.status(500).json({ error: 'Error updating snack' }); }
});

router.delete('/snacks/:id', async (req, res) => {
   try {
     if (mongoose.connection.readyState !== 1) return res.json({ success: true });
     const bakery = await Bakery.findOne({ bakerId: req.user.userId });
     if (bakery) {
       await Snack.findOneAndDelete({ _id: req.params.id, bakeryId: bakery._id });
     }
     res.json({ success: true });
   } catch (err) { res.status(500).json({ error: 'Error deleting snack' }); }
});

module.exports = router;

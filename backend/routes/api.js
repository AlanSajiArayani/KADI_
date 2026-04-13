const express = require('express');
const authMiddleware = require('../middleware/auth');
const Bakery = require('../models/Bakery');
const Snack = require('../models/Snack');

const router = express.Router();

router.get('/bakeries', authMiddleware, async (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat);
    const userLng = parseFloat(req.query.lng);

    // If using real MongoDB
    let bakeries = await Bakery.find();
    
    // For demo purposes if DB is empty, return dynamic mock
    if (bakeries.length === 0) {
      bakeries = [
        { _id: 'b1', name: "Liquid Glass Patisserie", location: { lat: userLat + 0.005, lng: userLng + 0.004 }, rating: 4.8 },
        { _id: 'b2', name: "Neumorphic Bakes", location: { lat: userLat - 0.008, lng: userLng - 0.003 }, rating: 4.5 }
      ];
    }

    res.json(bakeries);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching bakeries' });
  }
});

router.get('/snacks', authMiddleware, async (req, res) => {
  try {
    const { name, distance, rating, category, bakeryId } = req.query;
    
    let snacks = await Snack.find();
    
    if (snacks.length === 0) {
      snacks = [
        { _id: 's1', bakeryId: 'b1', title: "Orange Frosted Macaron", description: "Vibrant orange zest macaron with light vanilla cream.", price: 4.50, category: "Sweet", rating: 4.9, image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=60&w=400&h=300" },
        { _id: 's2', bakeryId: 'b1', title: "Savory Cheese Twist", description: "Crispy twisted pastry with aged cheddar.", price: 3.50, category: "Savory", rating: 4.5, image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&q=60&w=400&h=300" },
        { _id: 's3', bakeryId: 'b2', title: "Glass Croissant", description: "Flaky and buttery with a crystal sugar glaze.", price: 5.00, category: "Sweet", rating: 4.7, image: "https://images.unsplash.com/photo-1549903072-7e6e0efc568f?auto=format&fit=crop&q=60&w=400&h=300" }
      ];
    }
    
    // Filtering
    if (name) snacks = snacks.filter(s => s.title.toLowerCase().includes(name.toLowerCase()));
    if (category) snacks = snacks.filter(s => s.category.toLowerCase() === category.toLowerCase());
    if (rating) snacks = snacks.filter(s => s.rating >= parseFloat(rating));
    if (bakeryId) snacks = snacks.filter(s => s.bakeryId.toString() === bakeryId);
    
    res.json(snacks);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching snacks' });
  }
});

module.exports = router;

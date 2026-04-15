const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');
const Bakery = require('../models/Bakery');
const Snack = require('../models/Snack');
const Order = require('../models/Order');
const User = require('../models/User');

const router = express.Router();

router.get('/bakeries', async (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat) || 37.7749;
    const userLng = parseFloat(req.query.lng) || -122.4194;

    // If using real MongoDB
    let bakeries = await Bakery.find();
    
    // For demo purposes if DB is empty, return dynamic mock
    if (bakeries.length === 0) {
      bakeries = [
        { 
          _id: 'b1', 
          name: "Liquid Glass Patisserie", 
          description: "Premium artisanal pastries with a modern touch, baked fresh every morning to bring you the finest flavors.",
          images: ["https://images.unsplash.com/photo-1555507036-ab1f40ce88ca?auto=format&fit=crop&q=80&w=800"],
          location: { lat: userLat + 0.005, lng: userLng + 0.004 }, 
          rating: 4.8 
        },
        { 
          _id: 'b2', 
          name: "Neumorphic Bakes", 
          description: "The ultimate blending of traditional baking with cutting edge aesthetic flavors. Try our signature series.",
          images: ["https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&q=80&w=800"],
          location: { lat: userLat - 0.008, lng: userLng - 0.003 }, 
          rating: 4.5 
        },
        { 
          _id: 'b3', 
          name: "Crystal Treats", 
          description: "Handcrafted treats styled with a crystalline finish. Perfect for gifts and upscale events.",
          images: ["https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80&w=800"],
          location: { lat: userLat + 0.012, lng: userLng - 0.005 }, 
          rating: 4.9 
        }
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
    
    if (name) snacks = snacks.filter(s => s.title.toLowerCase().includes(name.toLowerCase()));
    if (category) snacks = snacks.filter(s => s.category.toLowerCase() === category.toLowerCase());
    if (rating) snacks = snacks.filter(s => s.rating >= parseFloat(rating));
    if (bakeryId) snacks = snacks.filter(s => s.bakeryId.toString() === bakeryId);
    
    res.json(snacks);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching snacks' });
  }
});

// Orders
router.post('/orders', authMiddleware, async (req, res) => {
  try {
    const { bakeryId, bakeryName, items, totalPrice } = req.body;
    
    let customerName = "Unknown Customer";
    let customerPhone = "N/A";

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.userId);
      if (user) {
        customerName = user.firstName || user.email;
        customerPhone = user.mobileNumber || "Not Provided";
      }
    } else {
      customerName = "Mock User Offline";
      customerPhone = "1234567890";
    }

    if (mongoose.connection.readyState !== 1) {
      const mockOrder = {
        _id: 'mock_order_' + Date.now(),
        userId: req.user.userId,
        customerName,
        customerPhone,
        bakeryId,
        bakeryName,
        items,
        totalPrice,
        status: 'Pending',
        createdAt: new Date()
      };
      if (req.io) req.io.to(bakeryId.toString()).emit('newOrder', mockOrder);
      return res.json(mockOrder);
    }

    const newOrder = await Order.create({
      userId: req.user.userId,
      customerName,
      customerPhone,
      bakeryId,
      bakeryName,
      items,
      totalPrice,
      status: 'Pending'
    });
    // Emit to baker
    if (req.io) req.io.to(bakeryId.toString()).emit('newOrder', newOrder);
    res.json(newOrder);
  } catch (err) {
    console.error("Order Creation Error:", err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

router.get('/orders', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([{
        _id: 'mock_order_1',
        bakeryId: 'b1',
        bakeryName: 'Liquid Mock Bakery',
        items: [{ title: 'Offline Donut (Mock)', price: 2.50, quantity: 2 }],
        totalPrice: 5.00,
        status: 'Preparing',
        createdAt: new Date()
      }]);
    }

    const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;

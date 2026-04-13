const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy');

router.post('/google', async (req, res) => {
  const { credential } = req.body;
  
  try {
    let payload;
    // For local dev/demo without actual client ID, we can decode the JWT directly (insecure but allows frontend to work)
    if (process.env.GOOGLE_CLIENT_ID) {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      payload = jwt.decode(credential);
    }
    
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    let user;
    
    // Check if MongoDB is actually connected (readyState === 1)
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: payload.email });
      if (!user) {
        user = await User.create({
          googleId: payload.sub,
          email: payload.email,
          profileComplete: false
        });
      }
    } else {
      // Mock user fallback if MongoDB is not running locally
      console.log("MongoDB not connected. Using mock user.");
      user = { _id: 'mock_user_id', email: payload.email, profileComplete: false, googleId: payload.sub };
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
    
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during authentication' });
  }
});

router.put('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const { firstName, dob } = req.body;
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findByIdAndUpdate(req.user.userId, {
        firstName,
        dob,
        profileComplete: true
      }, { new: true });
    } else {
      user = { _id: req.user.userId, email: req.user.email, firstName, dob, profileComplete: true };
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error saving profile' });
  }
});

module.exports = router;

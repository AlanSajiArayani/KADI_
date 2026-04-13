const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

// Serve Logo from system artifact path for demo purposes:
app.get('/api/logo', (req, res) => {
  res.sendFile('C:\\Users\\ALAN SAJI\\.gemini\\antigravity\\brain\\f66e93ff-1796-454c-8f1d-e651147f3186\\kadi_logo_1776093758195.png');
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kadi')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error, continuing with mock data. Error:', err.message));

app.listen(PORT, () => console.log(`Backend API running on http://localhost:${PORT}`));

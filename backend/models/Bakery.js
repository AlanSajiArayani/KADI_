const mongoose = require('mongoose');

const bakerySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { 
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  rating: { type: Number, default: 0 }
});

module.exports = mongoose.model('Bakery', bakerySchema);

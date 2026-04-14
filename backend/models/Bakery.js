const mongoose = require('mongoose');

const bakerySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  location: { 
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  images: [{ type: String }],
  bakerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  rating: { type: Number, default: 0 }
});

module.exports = mongoose.model('Bakery', bakerySchema);

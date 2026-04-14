const mongoose = require('mongoose');

const snackSchema = new mongoose.Schema({
  bakeryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bakery', required: true },
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  category: { type: String, enum: ['Sweet', 'Savory'] },
  rating: { type: Number, default: 0 },
  image: { type: String },
  quantity: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Snack', snackSchema);

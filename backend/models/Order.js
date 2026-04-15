const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  customerName: { type: String },
  customerPhone: { type: String },
  bakeryId: { type: String, required: true },
  bakeryName: { type: String, required: true },
  items: [
    {
      snackId: { type: String },
      title: String,
      price: Number,
      quantity: Number
    }
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Preparing', 'Ready'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

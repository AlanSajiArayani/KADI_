const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'baker'], required: true },
  bakeryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bakery', default: null } // Link baker account to their bakery
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);

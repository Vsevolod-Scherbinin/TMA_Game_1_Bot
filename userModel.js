const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  score: { type: Number, default: 0 },
  referenceBonus: { type: Number, default: 0 },
  referrals: { type: Array, default: [] }
});

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  score: { type: Number, default: 0 },
  referenceBonus: { type: Number, default: 0 },
  referrals: { type: Array, default: [] }
});

const User = mongoose.model('User', userSchema);

const botDBSchema = new mongoose.Schema({
  botId: { type: String, unique: true },
  botOwnerId: { type: String, unique: true },
  channels: { type: Array, default: [] }
});

const Bot = mongoose.model('Bot', botDBSchema);

module.exports = { User, Bot };

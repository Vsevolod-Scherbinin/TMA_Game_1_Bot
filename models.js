const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  score: { type: Number, default: 0 },
  delta: { type: Number, default: 0 },
  energy: { type: Number, default: 0 },
  cummulativeIncome: { type: Number, default: 0 },
  expences: { type: Number, default: 0 },
  taps: { type: Number, default: 0 },
  activeIncome: { type: Number, default: 0 },
  passiveIncome: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  timeOnline: { type: Number, default: 0 }, //seconds
  activeUpgrades: { type: Array, default: [] },
  passiveUpgrades: { type: Array, default: [] },
  tasks: { type: Array, default: [] },
  achievements: { type: Array, default: [] },
  gatheredAchievements: { type: Array, default: [] },
  referenceBonus: { type: Number, default: 0 },
  referrals: { type: Array, default: [] },
});

const User = mongoose.model('User', userSchema);

const botDBSchema = new mongoose.Schema({
  botId: { type: String, unique: true },
  botOwnerId: { type: String, unique: true },
  channels: { type: Array, default: [] }
});

const Bot = mongoose.model('Bot', botDBSchema);

module.exports = { User, Bot };

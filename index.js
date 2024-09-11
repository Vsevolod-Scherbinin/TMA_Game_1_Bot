const TelegramApi = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const express = require('express');

const app = express();
const port = 3200;

app.use(express.json());

const allowedCors = [
  'http://127.0.0.1:5500',
  'http://localhost:4000',
  'http://localhost:3001',
  'https://vsevolod-scherbinin.github.io',
];

const cors = (req, res, next) => {
  const { origin } = req.headers;
  const requestHeaders = req.headers['access-control-request-headers'];
  const { method } = req;
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  res.header('Access-Control-Allow-Credentials', true);
  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    return res.end();
  }
  return next();
};

app.use(cors);

app.get('/getUserData/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ userId });
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/users', async (req, res) => {
  try {
    res.send('user');
  } catch (error) {
    res.status(500).send(error);
  }
});

const botOwnerId = '180799659';

const bot = new TelegramApi('6750879766:AAFr6iUUudfD_zxG6RE87VbRblR5uRrSTao', {polling: true});

mongoose.connect('mongodb://localhost:27017/tma_game_1');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  score: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);

const options = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text: 'Запустить', web_app: { url: 'https://vsevolod-scherbinin.github.io/TMA_Game_1_OOP/' }}]
    ]
  })
}

bot.setMyCommands([
  {command: '/start', description: 'Начать игру'},
])

bot.on('message', async msg => {
  const text = msg.text;
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  // console.log('text', text);
  // console.log('chatId', chatId);
  // console.log('msg', msg);

  if(text.includes('start')) {
    try {
      const newUser = await User.create({ userId });
    } catch {}
    const params = text.split(' ');
    const referralId = params[1] ? params[1].split('=')[1] : null;

    await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/bac/a66/baca6623-5f6a-3ab2-af07-b477d91e297a/8.webp');
    if (referralId) {
      return bot.sendMessage(chatId, `Добро пожаловать! Вы пришли по приглашению пользователя с ID: ${referralId}`, options);
        // Здесь можно добавить логику для начисления бонусов
    } else {
      return bot.sendMessage(chatId, `Добро пожаловать! Играй и заработай как можно больше очков!`, options);
    }
  }

  if(userId === botOwnerId && text === '!info') {
    const userCount = await User.countDocuments();
    return bot.sendMessage(userId, `Количество пользователей: ${userCount}`);
  }
  return bot.sendMessage(chatId, `Я вас не понимаю. Попробуйте воспользоваться командами.`);
})

// bot.on('message', async msg => {
//   const text = msg.text;
//   const chatId = msg.chat.id;

//   if (text.startsWith('/start')) {
//       const params = text.split(' ');
//       const referralId = params[1] ? params[1].split('=')[1] : null;

//       if (referralId) {
//           await bot.sendMessage(chatId, `Добро пожаловать! Вы пришли по приглашению пользователя с ID: ${referralId}`);
//           // Здесь можно добавить логику для начисления бонусов
//       } else {
//           await bot.sendMessage(chatId, `Добро пожаловать! Играй и заработай как можно больше очков!`);
//       }
//   }
// });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

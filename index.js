const TelegramApi = require('node-telegram-bot-api');
const mongoose = require('mongoose');

const token = '6750879766:AAFr6iUUudfD_zxG6RE87VbRblR5uRrSTao';
const ownerId = '180799659';

const bot = new TelegramApi(token, {polling: true});

mongoose.connect('mongodb://localhost:27017/tma_game_1');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  score: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);

// async function getUserCount() {
//   try {
//     const userCount = await User.countDocuments();
//     console.log(`Количество пользователей: ${userCount}`)
//     return userCount;
//   } catch (error) {
//     console.error('Ошибка при подсчете пользователей:', error);
//   }
// }

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
  console.log('text', text);
  console.log('chatId', chatId);
  console.log('msg', msg);

  if(text.includes('start')) {
    try {
      // Используем метод create для создания нового пользователя
      const newUser = await User.create({ userId });
      // return bot.sendMessage(userId, 'Добро пожаловать! Пользователь создан.');
    } catch {}

    await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/bac/a66/baca6623-5f6a-3ab2-af07-b477d91e297a/8.webp');
    return bot.sendMessage(chatId, `Добро пожаловать! Играй и заработай как можно больше очков!`, options);
  }
  // if(text === '/info') {
  //   return bot.sendMessage(chatId, `Добро пожаловать! Играй и заработай как можно больше очков!`);
  // }

  if(text === '!info') {
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

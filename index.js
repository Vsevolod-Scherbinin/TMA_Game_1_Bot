const TelegramApi = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const express = require('express');

// --------------- Server-Start ---------------
const app = express();
const port = 3200;
app.use(express.json());
const cors = require('./cors');
app.use(cors);

mongoose.connect('mongodb://localhost:27017/tma_game_1');
const User = require('./userModel');

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
// --------------- Server-End ---------------

// --------------- Bot-Start ---------------
const botOwnerId = '180799659';

const bot = new TelegramApi('6750879766:AAFr6iUUudfD_zxG6RE87VbRblR5uRrSTao', {polling: true});



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
      const referrer = await User.findOne({ userId: referralId });

      if (referrer && !referrer.referrals.includes(userId)) {
        await User.updateOne(
          { userId: referralId },
          {
            $inc: { referenceBonus: 100 }, // Увеличиваем бонусные очки для пригласившего
            $push: { referrals: userId } // Добавляем ID приглашенного в массив
          }
        );
      } else {
        console.log('Вы уже получили бонусы за это приглашение');
      }
        await User.updateOne(
          { userId },
          { $inc: { referenceBonus: 100 } } // Увеличиваем бонусные очки для приглашенного
        );
      return bot.sendMessage(chatId, `Добро пожаловать! Вы пришли по приглашению пользователя с ID: ${referralId}`, options);
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

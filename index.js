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
const { User, Bot } = require('./models');

app.get('/getUserData/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ userId });
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// app.get('/users', async (req, res) => {
//   try {
//     res.send('user');
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });
// --------------- Server-End ---------------

// --------------- Bot-Start ---------------
const botOwnerId = '180799659';

const bot = new TelegramApi('6750879766:AAFr6iUUudfD_zxG6RE87VbRblR5uRrSTao', {polling: true});

let botData = {};

async function botDataLoad() {
  const myBot = await bot.getMe();
  const botData = await Bot.findOne({ botId: myBot.id });
  return botData;
}

async function createBotInDB() {
  const myBot = await bot.getMe();
  const newBot = await Bot.create({
    botId: myBot.id,
    botOwnerId: botOwnerId,
  });
  botData = newBot;
}

async function botLoading() {
  const loadedBotData = await botDataLoad();
  if(loadedBotData) {
    botData = loadedBotData;
    // console.log('Данные загружены', botData);
  } else {
    await createBotInDB();
    // console.log('Данные созданы', botData);
  }
}

// botData.channels[0]
function channelSubscribtionCheck(channelId, userId) {
  botData.channels.length > 0 && bot.getChatMember(channelId, userId)
    .then((chatMember) => {
      if (chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator') {
        console.log(`Пользователь с ID ${userId} подписан на канал!`);
      } else {
        console.log(`Пользователь с ID ${userId} не подписан на канал!`);
      }
    })
    .catch((error) => {
      console.error('Ошибка при проверке подписки:', error);
      bot.sendMessage(userId, 'Произошла ошибка при проверке подписки. Возможно, пользователь не найден или бот не является администратором канала.');
    });
}

botLoading().then(() => {
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
              $inc: { referenceBonus: 100 },
              $push: { referrals: userId }
            }
          );
        } else {
          console.log('Вы уже получили бонусы за это приглашение');
        }
          await User.updateOne(
            { userId },
            { $inc: { referenceBonus: 100 } }
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

  bot.on('my_chat_member', async (msg) => {
    const chatMember = msg.new_chat_member.status;
    // console.log('msg', msg);
    // console.log('chatMember', chatMember);
    const chatId = msg.chat.id;
    if (chatMember === 'administrator') {
      if (!botData.channels.includes(chatId)) {
        botData.channels.push(chatId);
        await Bot.updateOne(
          { botId: botData.botId },
          { $push: { channels: chatId } }
        );
        console.log('botData.channels', botData.channels);
        console.log(`Бот добавлен в новый канал. ID канала: ${chatId}`);
      }
    } else {
      botData.channels.pull(chatId);
      await Bot.updateOne(
        { botId: botData.botId },
        { $pull: { channels: chatId } }
      );
      console.log('botData.channels', botData.channels);
      console.log(`Бот удалён из канала. ID канала: ${chatId}`);
    }
  });

  // --------------- Subscribtion-Check-Start ---------------
  // const userId = 653832788; // ID пользователя, который нужно проверить
  // channelSubscribtionCheck(botData.channels[0], 653832788);
  app.post('/checkSubscription', async (req, res) => {
    const { userId, channelId } = req.body; // Получаем userId и channelId из запроса

    try {
      const chatMember = await bot.getChatMember(channelId, userId);
      if (chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator') {
        res.json({ subscribed: true });
      } else {
        res.json({ subscribed: false });
      }
    } catch (error) {
      console.error('Ошибка при проверке подписки:', error);
      res.status(500).json({ error: 'Ошибка при проверке подписки' });
    }
  });

  bot.on('polling_error', (err) => {
    console.log(err);
  });
});
// --------------- Subscribtion-Check-End ---------------
// --------------- Bot-End ---------------

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

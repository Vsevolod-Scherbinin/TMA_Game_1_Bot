const TelegramApi = require('node-telegram-bot-api');

const token = '6750879766:AAFr6iUUudfD_zxG6RE87VbRblR5uRrSTao';
const ownerId = '180799659';

const bot = new TelegramApi(token, {polling: true});

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
    await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/bac/a66/baca6623-5f6a-3ab2-af07-b477d91e297a/8.webp');
    return bot.sendMessage(chatId, `Добро пожаловать! Играй и заработай как можно больше очков!`, options);
  }
  // if(text === '/info') {
  //   return bot.sendMessage(chatId, `Добро пожаловать! Играй и заработай как можно больше очков!`);
  // }

  if(text === '!info') {
    return bot.sendMessage(userId, `Статистика`);
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

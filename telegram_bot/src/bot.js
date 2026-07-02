const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const API_BASE = process.env.FRONTEND_URL || 'http://localhost:3000';

const MESSAGES_UK = {
  start: '👋 Вітаємо у магазині! Оберіть опцію з меню нижче.',
  catalog: '📦 Каталог товарів',
  prices: '💰 Поточні ціни',
  about: 'ℹ️ Про магазин',
  support: '🆘 Підтримка',
  orders: '📋 Мої замовлення',
  menu: '🏠 Головне меню',
  selectCategory: '📂 Оберіть категорію:',
  selectProduct: '🛍️ Оберіть товар:',
  back: '⬅️ Назад',
  buy: '💳 Купити',
  pending: '⏳ Замовлення в процесі обробки',
  completed: '✅ Замовлення завершено',
  cancelled: '❌ Замовлення скасовано',
  aboutText: `
🌟 Telegram Gift & NFT Shop

Ми пропонуємо:
• 🌟 Telegram Stars
• 🎁 Цифрові подарунки
• 🖼️ NFT колекції
• 💎 Premium послуги

Подтримуємо платежі:
• TON Wallet
• Telegram Stars
• Ручне підтвердження

📱 Спілкуйтеся з нами!
  `,
  supportText: `
🆘 Служба підтримки

Якщо у вас є питання або проблеми:

📧 Email: support@shop.local
💬 Telegram: @support_bot
⏰ Час роботи: 24/7

Ми готові вам допомогти!
  `
};

const getMainKeyboard = () => ({
  reply_markup: {
    keyboard: [
      [{ text: '📦 Каталог' }, { text: '💰 Ціни' }],
      [{ text: '📋 Мої замовлення' }, { text: '🆘 Підтримка' }],
      [{ text: 'ℹ️ Про магазин' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  }
});

const getBackKeyboard = () => ({
  reply_markup: {
    keyboard: [
      [{ text: '⬅️ Назад в меню' }]
    ],
    resize_keyboard: true
  }
});

bot.onText(/^\/start$/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;

  try {
    await axios.post(`${API_BASE}/api/users`, {
      telegram_id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      language_code: user.language_code || 'uk'
    });
  } catch (error) {
    console.error('Error creating user:', error);
  }

  bot.sendMessage(chatId, MESSAGES_UK.start, getMainKeyboard());
});

bot.onText(/📦 Каталог|^catalog$/i, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const response = await axios.get(`${API_BASE}/api/categories`);
    const categories = response.data;

    const keyboard = {
      reply_markup: {
        keyboard: [
          ...categories.map(cat => [{ text: `${cat.icon} ${cat.name}` }]),
          [{ text: '⬅️ Назад в меню' }]
        ],
        resize_keyboard: true
      }
    };

    bot.sendMessage(chatId, MESSAGES_UK.selectCategory, keyboard);
  } catch (error) {
    console.error('Error fetching categories:', error);
    bot.sendMessage(chatId, '❌ Помилка завантаження категорій');
  }
});

bot.onText(/💰 Ціни|^prices$/i, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const response = await axios.get(`${API_BASE}/api/products`);
    const products = response.data;

    if (products.length === 0) {
      return bot.sendMessage(chatId, '📦 Товарів немає');
    }

    let priceText = '💰 <b>Поточні ціни:</b>\n\n';
    products.slice(0, 10).forEach(product => {
      priceText += `<b>${product.name}</b>\n`;
      priceText += `   💵 ${product.price_uah} грн\n`;
      priceText += `   🪙 ${product.price_ton} TON\n\n`;
    });

    bot.sendMessage(chatId, priceText, {
      parse_mode: 'HTML',
      ...getBackKeyboard()
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    bot.sendMessage(chatId, '❌ Помилка завантаження цін');
  }
});

bot.onText(/📋 Мої замовлення|^orders$/i, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;

  try {
    const userResponse = await axios.get(`${API_BASE}/api/users/${telegramId}`);
    const user = userResponse.data;

    const ordersResponse = await axios.get(`${API_BASE}/api/orders/user/${user.id}`);
    const orders = ordersResponse.data;

    if (orders.length === 0) {
      return bot.sendMessage(chatId, '📭 У вас немає замовлень', getBackKeyboard());
    }

    let ordersText = '📋 <b>Ваші замовлення:</b>\n\n';
    orders.slice(0, 5).forEach((order, index) => {
      const statusEmoji = order.status === 'completed' ? '✅' : '⏳';
      ordersText += `${index + 1}. ${statusEmoji} <b>${order.product_name}</b>\n`;
      ordersText += `   Статус: ${order.status}\n`;
      ordersText += `   Ціна: ${order.price_uah} грн\n\n`;
    });

    bot.sendMessage(chatId, ordersText, {
      parse_mode: 'HTML',
      ...getBackKeyboard()
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    bot.sendMessage(chatId, '❌ Помилка завантаження замовлень');
  }
});

bot.onText(/🆘 Підтримка|^support$/i, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, MESSAGES_UK.supportText, {
    parse_mode: 'HTML',
    ...getBackKeyboard()
  });
});

bot.onText(/ℹ️ Про магазин|^about$/i, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, MESSAGES_UK.aboutText, {
    parse_mode: 'HTML',
    ...getBackKeyboard()
  });
});

bot.onText(/⬅️ Назад в меню|^menu$/i, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, MESSAGES_UK.start, getMainKeyboard());
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.startsWith('/')) return;
  if (['📦 Каталог', '💰 Ціни', '📋 Мої замовлення', '🆘 Підтримка', 'ℹ️ Про магазин', '⬅️ Назад в меню'].includes(text)) return;

  try {
    const categoriesResponse = await axios.get(`${API_BASE}/api/categories`);
    const categories = categoriesResponse.data;

    const category = categories.find(c => text.includes(c.name));

    if (category) {
      const productsResponse = await axios.get(`${API_BASE}/api/products/category/${category.id}`);
      const products = productsResponse.data;

      if (products.length === 0) {
        return bot.sendMessage(chatId, '📭 У цій категорії немає товарів');
      }

      const keyboard = {
        reply_markup: {
          inline_keyboard: products.map(product => [
            { text: `${product.name} (${product.price_uah} грн)`, callback_data: `buy_${product.id}` }
          ]).concat([[
            { text: '⬅️ Назад', callback_data: 'catalog' }
          ]])
        }
      };

      bot.sendMessage(chatId, MESSAGES_UK.selectProduct, keyboard);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'catalog') {
    return bot.editMessageText(MESSAGES_UK.selectCategory, {
      chat_id: chatId,
      message_id: query.message.message_id,
      reply_markup: {
        inline_keyboard: [[
          { text: '⬅️ Назад', callback_data: 'menu' }
        ]]
      }
    });
  }

  if (data === 'menu') {
    return bot.editMessageText(MESSAGES_UK.start, {
      chat_id: chatId,
      message_id: query.message.message_id,
      reply_markup: { keyboard: [] }
    });
  }

  if (data.startsWith('buy_')) {
    const productId = data.replace('buy_', '');

    try {
      const productResponse = await axios.get(`${API_BASE}/api/products/${productId}`);
      const product = productResponse.data;

      const userResponse = await axios.get(`${API_BASE}/api/users/${query.from.id}`);
      const user = userResponse.data;

      const orderResponse = await axios.post(`${API_BASE}/api/orders`, {
        user_id: user.id,
        product_id: productId,
        quantity: 1,
        currency: 'UAH',
        payment_method: 'ton_wallet'
      });

      const orderText = `
✅ <b>Замовлення створено!</b>

📦 Товар: ${product.name}
💵 Ціна: ${product.price_uah} грн
🪙 TON: ${product.price_ton} TON

⏳ Статус: Очікування оплати

💳 Оплатіть замовлення через:
🪙 TON Wallet
⭐ Telegram Stars

📝 ID замовлення: ${orderResponse.order_id}
      `;

      bot.sendMessage(chatId, orderText, { parse_mode: 'HTML', ...getBackKeyboard() });
    } catch (error) {
      console.error('Error creating order:', error);
      bot.sendMessage(chatId, '❌ Помилка створення замовлення');
    }
  }
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

module.exports = bot;

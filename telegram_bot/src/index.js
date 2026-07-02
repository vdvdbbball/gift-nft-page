require('dotenv').config({ path: '../config/.env' });
const bot = require('./bot');

console.log('🤖 Telegram Bot started...');
console.log(`📍 Bot token configured: ${process.env.TELEGRAM_BOT_TOKEN ? '✓' : '✗'}`);

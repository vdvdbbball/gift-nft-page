#!/bin/bash

echo "🚀 Telegram Gift & NFT Shop - Setup Script"
echo "=========================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не встановлено. Будь ласка встановіть Node.js 14+"
    exit 1
fi

echo "✓ Node.js версія: $(node -v)"
echo "✓ NPM версія: $(npm -v)"

# Create uploads directory
mkdir -p uploads
echo "✓ Папка uploads створена"

# Setup Backend
echo ""
echo "📦 Встановлення Backend залежностей..."
cd backend
npm install
echo "✓ Backend залежності встановлені"

# Create .env file if not exists
if [ ! -f ../config/.env ]; then
    cp ../config/.env.example ../config/.env
    echo "✓ Файл config/.env створено (оновіть дані перед запуском)"
else
    echo "ℹ️  Файл config/.env вже існує"
fi

cd ..

# Setup Telegram Bot
echo ""
echo "🤖 Встановлення Telegram Bot залежностей..."
cd telegram_bot
npm install
echo "✓ Telegram Bot залежності встановлені"
cd ..

# Setup Frontend (якщо потрібно)
echo ""
echo "🌐 Frontend налаштовано (без залежностей)"

# Setup Admin Panel (якщо потрібно)
echo ""
echo "🛡️  Admin Panel налаштовано (без залежностей)"

echo ""
echo "✅ Встановлення завершено!"
echo ""
echo "📝 Наступні кроки:"
echo "1. Оновіть config/.env з вашими даними"
echo "2. Запустіть backend: cd backend && npm run dev"
echo "3. Запустіть telegram bot: cd telegram_bot && npm start"
echo "4. Відкрийте frontend: http://localhost:3001"
echo "5. Відкрийте admin: http://localhost:3002"
echo ""

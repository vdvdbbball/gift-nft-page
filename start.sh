#!/bin/bash

echo "🚀 Запуск Telegram Gift & NFT Shop"
echo "==================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if processes are already running
echo "📋 Перевірка портів..."

if lsof -i :3000 > /dev/null 2>&1; then
    echo "${RED}❌ Порт 3000 уже зайнятий${NC}"
else
    echo "${GREEN}✓ Порт 3000 вільний${NC}"
fi

if lsof -i :3001 > /dev/null 2>&1; then
    echo "${RED}❌ Порт 3001 уже зайнятий${NC}"
else
    echo "${GREEN}✓ Порт 3001 вільний${NC}"
fi

if lsof -i :3002 > /dev/null 2>&1; then
    echo "${RED}❌ Порт 3002 уже зайнятий${NC}"
else
    echo "${GREEN}✓ Порт 3002 вільний${NC}"
fi

echo ""
echo "🔧 Запуск сервісів..."
echo ""

# Start Backend
echo "${YELLOW}→ Backend запускається на порту 3000...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
echo "${GREEN}✓ Backend PID: $BACKEND_PID${NC}"
cd ..

sleep 2

# Start Telegram Bot
echo ""
echo "${YELLOW}→ Telegram Bot запускається...${NC}"
cd telegram_bot
npm start &
BOT_PID=$!
echo "${GREEN}✓ Bot PID: $BOT_PID${NC}"
cd ..

echo ""
echo "${GREEN}✅ Все запущено!${NC}"
echo ""
echo "📍 URL сервісів:"
echo "   🔗 Backend API: http://localhost:3000"
echo "   🌐 Frontend: http://localhost:3001"
echo "   🛡️  Admin Panel: http://localhost:3002"
echo "   🤖 Telegram Bot: запущено"
echo ""
echo "💡 Натисніть Ctrl+C для зупинення"
echo ""

# Cleanup on exit
trap "kill $BACKEND_PID $BOT_PID 2>/dev/null" EXIT

# Wait for all processes
wait

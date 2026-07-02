# Telegram Gift & NFT Shop - Документація

## 📋 Зміст

1. [Встановлення](#встановлення)
2. [Конфігурація](#конфігурація)
3. [Запуск](#запуск)
4. [API Документація](#api-документація)
5. [Telegram Bot](#telegram-bot)
6. [Адмін-Панель](#адмін-панель)
7. [Структура Проекту](#структура-проекту)
8. [Безпека](#безпека)

---

## 🔧 Встановлення

### Вимоги

- **Node.js** 14.0+
- **NPM** 6.0+
- **SQLite** або **PostgreSQL** (за вибором)

### Крок 1: Клонування репозиторію

```bash
git clone https://github.com/vdvdbbball/gift-nft-page.git
cd gift-nft-page
```

### Крок 2: Встановлення залежностей

```bash
bash setup.sh
```

Або вручну:

```bash
# Backend
cd backend
npm install
cd ..

# Telegram Bot
cd telegram_bot
npm install
cd ..
```

---

## ⚙️ Конфігурація

### Основні параметри (config/.env)

```env
# Database
DATABASE_URL=./telegram_shop.db
DATABASE_TYPE=sqlite

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRATION=7d

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username

# Ports
PORT=3000
FRONTEND_URL=http://localhost:3001
ADMIN_URL=http://localhost:3002

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### PostgreSQL (опціонально)

Якщо бажаєте використовувати PostgreSQL:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/telegram_shop
DATABASE_TYPE=postgresql
```

---

## 🚀 Запуск

### Автоматичний запуск

```bash
bash start.sh
```

### Ручний запуск

**Термінал 1 - Backend:**
```bash
cd backend
npm run dev
```

**Термінал 2 - Telegram Bot:**
```bash
cd telegram_bot
npm start
```

**Термінал 3 - Frontend (локальний сервер, опціонально):**
```bash
cd frontend
python -m http.server 3001
# або
npx http-server -p 3001
```

**Термінал 4 - Admin (локальний сервер, опціонально):**
```bash
cd admin
python -m http.server 3002
# або
npx http-server -p 3002
```

### Доступні URL

- 🔗 **Backend API**: http://localhost:3000/api
- 🌐 **Frontend**: http://localhost:3001
- 🛡️ **Admin Panel**: http://localhost:3002
- 📊 **Health Check**: http://localhost:3000/health

---

## 📚 API Документація

### Аутентифікація

Всі захищені endpoint'и потребують JWT токену в заголовку:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Користувачі

#### Отримати користувача
```
GET /api/users/:telegramId
```

#### Створити користувача
```
POST /api/users
Body: {
  "telegram_id": 123456789,
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "language_code": "uk"
}
```

#### Отримати всіх користувачів (Адмін)
```
GET /api/users/admin/all
Headers: Authorization: Bearer TOKEN
```

### Товари

#### Отримати всі товари
```
GET /api/products
```

#### Отримати товар за ID
```
GET /api/products/:id
```

#### Отримати товари за категорією
```
GET /api/products/category/:categoryId
```

#### Створити товар (Адмін)
```
POST /api/admin/products
Headers: Authorization: Bearer TOKEN
Body: {
  "name": "10 Telegram Stars",
  "description": "Пакет з 10 зірок",
  "category_id": 1,
  "price_uah": 50,
  "price_ton": 0.05,
  "is_active": 1
}
```

#### Оновити товар (Адмін)
```
PUT /api/admin/products/:id
Headers: Authorization: Bearer TOKEN
Body: { /* updated fields */ }
```

#### Видалити товар (Адмін)
```
DELETE /api/admin/products/:id
Headers: Authorization: Bearer TOKEN
```

### Категорії

#### Отримати категорії
```
GET /api/categories
```

#### Створити категорію (Адмін)
```
POST /api/categories
Headers: Authorization: Bearer TOKEN
Body: {
  "name": "NFT Подарунки",
  "description": "NFT колекції",
  "icon": "🎁"
}
```

#### Оновити категорію (Адмін)
```
PUT /api/categories/:id
Headers: Authorization: Bearer TOKEN
```

#### Видалити категорію (Адмін)
```
DELETE /api/categories/:id
Headers: Authorization: Bearer TOKEN
```

### Замовлення

#### Створити замовлення
```
POST /api/orders
Headers: Authorization: Bearer TOKEN
Body: {
  "product_id": 1,
  "quantity": 1,
  "currency": "UAH",
  "payment_method": "ton_wallet"
}
```

#### Отримати замовлення користувача
```
GET /api/orders/user/:userId
```

#### Отримати всі замовлення (Адмін)
```
GET /api/orders/admin/all?page=1&limit=50
Headers: Authorization: Bearer TOKEN
```

#### Оновити статус замовлення (Адмін)
```
PATCH /api/orders/:id/status
Headers: Authorization: Bearer TOKEN
Body: {
  "status": "completed",
  "notes": "Замовлення відправлено"
}
```

#### Отримати статистику (Адмін)
```
GET /api/admin/stats
Headers: Authorization: Bearer TOKEN
```

### Аутентифікація

#### Вхід
```
POST /api/auth/login
Body: {
  "username": "admin",
  "password": "admin123"
}

Response: {
  "token": "JWT_TOKEN",
  "admin": { "id": 1, "username": "admin", "email": "admin@example.com" }
}
```

#### Перевірка токену
```
GET /api/auth/verify
Headers: Authorization: Bearer TOKEN
```

---

## 🤖 Telegram Bot

### Команди

- `/start` - Розпочати роботу з ботом
- `/catalog` - Переглянути каталог
- `/prices` - Переглянути ціни
- `/orders` - Мої замовлення
- `/about` - Про магазин
- `/support` - Служба підтримки

### Функціональність

- 📱 Перегляд каталогу товарів за категоріями
- 💳 Створення замовлень
- 💰 Перегляд цін в гривнях та TON
- 📋 Історія замовлень
- 🛟 Служба підтримки
- 🌐 Українська мова

---

## 🛡️ Адмін-Панель

### Вхід

```
URL: http://localhost:3002
Логін: admin
Пароль: admin123
```

### Функціональність

#### 📊 Панель
- Загальна статистика
- Кількість замовлень та доходи
- Кількість користувачів
- Останні замовлення

#### 📦 Товари
- Додавання нових товарів
- Редагування товарів
- Видалення товарів
- Активація/деактивація
- Управління цінами

#### 📂 Категорії
- Створення категорій
- Редагування категорій
- Видалення категорій
- Управління іконками

#### 📋 Замовлення
- Перегляд всіх замовлень
- Зміна статусу замовлень
- Фільтрування за статусом
- Додавання примітки

#### 👥 Користувачі
- Список користувачів
- Інформація про користувачів
- Статус Premium
- Остання активність

#### ⚙️ Налаштування
- Управління параметрами системи
- Конфігурація платежів
- Налаштування бота

---

## 📁 Структура Проекту

```
.
├── backend/                      # Node.js/Express сервер
│   ├── src/
│   │   ├── index.js             # Головний файл
│   │   ├── database/            # БД підключення
│   │   │   ├── connection.js
│   │   │   └── migrations/      # Схеми таблиць
│   │   ├── models/              # Моделі даних
│   │   ├── routes/              # API маршрути
│   │   └── middleware/          # Middleware
│   └── package.json
│
├── frontend/                     # Веб-сайт
│   ├── index.html              # Головна сторінка
│   ├── css/
│   │   └── style.css           # Стилі
│   └── js/
│       └── app.js              # JavaScript
│
├── admin/                        # Адмін-панель
│   ├── index.html              # Интерфейс
│   ├── css/
│   │   └── admin.css           # Стилі
│   └── js/
│       └── admin.js            # Логіка
│
├── telegram_bot/                 # Telegram Bot
│   ├── src/
│   │   ├── index.js            # Входа точка
│   │   └── bot.js              # Логіка бота
│   └── package.json
│
├── config/
│   ├── .env.example            # Приклад конфігурації
│   └── .env                    # Конфігурація
│
├── uploads/                      # Завантажені файли
├── database/                     # Бази даних
├── setup.sh                      # Скрипт встановлення
├── start.sh                      # Скрипт запуску
└── README.md                     # Документація
```

---

## 🔒 Безпека

### Реалізовано

✅ JWT аутентифікація  
✅ Хешування паролів (bcryptjs)  
✅ Валідація вхідних даних (express-validator)  
✅ CORS захист  
✅ Захист від SQL Injection (параметризовані запити)  
✅ Захист від XSS  
✅ Захист від CSRF (токени)  

### Рекомендації

1. **Змініть JWT_SECRET** в config/.env
2. **Змініть ADMIN_PASSWORD** на сильний пароль
3. **Використовуйте HTTPS** в продакшені
4. **Налаштуйте CORS** для вашого домену
5. **Регулярно оновлюйте** залежності
6. **Резервуйте базу даних**

---

## 🐛 Вирішення проблем

### Backend не запускається

```bash
# Перевірте порт
lsof -i :3000

# Очистіть npm кеш
npm cache clean --force

# Перевстановіть залежності
rm -rf node_modules package-lock.json
npm install
```

### Telegram Bot не відповідає

1. Перевірте TELEGRAM_BOT_TOKEN в config/.env
2. Переконайтеся, що Bot API включена
3. Перевірте Network з BotFather

### База даних недоступна

```bash
# Видаліть стару БД
rm telegram_shop.db

# Скрипт автоматично пересоздаст
npm run dev
```

---

## 📞 Підтримка

Якщо у вас є питання:

1. Перевірте документацію
2. Перевірте логи (`npm run dev`)
3. Створіть Issue на GitHub
4. Зв'яжіться через Telegram

---

## 📄 Ліцензія

MIT License - вільне використання для особистих та комерційних проектів.

---

**Створено з ❤️ для Telegram спільноти**

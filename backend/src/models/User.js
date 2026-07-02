const db = require('./connection');

const getAllUsers = (limit = 100, offset = 0) => {
  return db.query(
    'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
};

const getUserByTelegramId = (telegramId) => {
  return db.get(
    'SELECT * FROM users WHERE telegram_id = ? LIMIT 1',
    [telegramId]
  );
};

const createUser = (telegramId, userData) => {
  return db.query(
    `INSERT INTO users (telegram_id, username, first_name, last_name, language_code)
     VALUES (?, ?, ?, ?, ?)`,
    [telegramId, userData.username, userData.first_name, userData.last_name, userData.language_code || 'uk']
  );
};

const updateUser = (userId, userData) => {
  const updates = [];
  const values = [];

  Object.keys(userData).forEach(key => {
    updates.push(`${key} = ?`);
    values.push(userData[key]);
  });

  values.push(userId);

  return db.query(
    `UPDATE users SET ${updates.join(', ')}, updated_at = datetime("now") WHERE id = ?`,
    values
  );
};

const updateUserLastSeen = (userId) => {
  return db.query(
    'UPDATE users SET last_seen_at = datetime("now") WHERE id = ?',
    [userId]
  );
};

const getUserStats = () => {
  return db.get(
    `SELECT COUNT(*) as total, 
            COUNT(CASE WHEN is_premium = 1 THEN 1 END) as premium
     FROM users`
  );
};

module.exports = {
  getAllUsers,
  getUserByTelegramId,
  createUser,
  updateUser,
  updateUserLastSeen,
  getUserStats
};

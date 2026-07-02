const db = require('./connection');

const getAdminByUsername = (username) => {
  return db.get(
    'SELECT * FROM admins WHERE username = ? LIMIT 1',
    [username]
  );
};

const createAdmin = (username, passwordHash, email) => {
  return db.query(
    'INSERT INTO admins (username, password_hash, email) VALUES (?, ?, ?)',
    [username, passwordHash, email]
  );
};

const updateAdminLastLogin = (adminId) => {
  return db.query(
    'UPDATE admins SET last_login = datetime("now") WHERE id = ?',
    [adminId]
  );
};

const getAllAdmins = () => {
  return db.query('SELECT id, username, email, is_active, last_login, created_at FROM admins');
};

module.exports = {
  getAdminByUsername,
  createAdmin,
  updateAdminLastLogin,
  getAllAdmins
};

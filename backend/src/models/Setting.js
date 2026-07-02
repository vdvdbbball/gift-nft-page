const db = require('./connection');

const getSetting = (key) => {
  return db.get('SELECT * FROM settings WHERE key = ?', [key]);
};

const getAllSettings = () => {
  return db.query('SELECT * FROM settings');
};

const setSetting = (key, value, type = 'string', description = '') => {
  return new Promise(async (resolve, reject) => {
    try {
      const existing = await getSetting(key);
      if (existing) {
        await db.query(
          'UPDATE settings SET value = ?, type = ?, description = ?, updated_at = datetime("now") WHERE key = ?',
          [value, type, description, key]
        );
      } else {
        await db.query(
          'INSERT INTO settings (key, value, type, description) VALUES (?, ?, ?, ?)',
          [key, value, type, description]
        );
      }
      resolve({ key, value, type });
    } catch (err) {
      reject(err);
    }
  });
};

const deleteSetting = (key) => {
  return db.query('DELETE FROM settings WHERE key = ?', [key]);
};

const getSettingValue = async (key, defaultValue = null) => {
  try {
    const setting = await getSetting(key);
    return setting ? setting.value : defaultValue;
  } catch {
    return defaultValue;
  }
};

module.exports = {
  getSetting,
  getAllSettings,
  setSetting,
  deleteSetting,
  getSettingValue
};

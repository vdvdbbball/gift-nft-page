const fs = require('fs');
const path = require('path');

let db;
let isPostgres = false;

const initialize = async () => {
  const dbType = process.env.DATABASE_TYPE || 'sqlite';

  if (dbType === 'postgresql') {
    const { Client } = require('pg');
    db = new Client({
      connectionString: process.env.DATABASE_URL
    });
    isPostgres = true;
    await db.connect();
  } else {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = process.env.DATABASE_URL || './telegram_shop.db';
    
    // Ensure uploads directory exists
    const uploadsDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error('SQLite error:', err);
    });

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
  }

  await runMigrations();
};

const runMigrations = async () => {
  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    if (isPostgres) {
      try {
        await db.query(sql);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.error(`Error running migration ${file}:`, err);
        }
      }
    } else {
      await new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
          if (err && !err.message.includes('already exists')) {
            console.error(`Error running migration ${file}:`, err);
          }
          resolve();
        });
      });
    }
  }
};

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result.rows);
      });
    } else {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      } else {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, changes: this.changes });
        });
      }
    }
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result.rows[0]);
      });
    } else {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    }
  });
};

module.exports = { initialize, query, get, db, isPostgres };

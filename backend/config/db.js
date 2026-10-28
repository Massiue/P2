import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbType = 'mysql';
let pool = null;
let sqliteDb = null;

// Helper to run query regardless of underlying database engine
export const query = async (sql, params = []) => {
  if (dbType === 'mysql' && pool) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (err) {
      console.error('MySQL Query Error:', err.message);
      throw err;
    }
  } else if (sqliteDb) {
    return new Promise((resolve, reject) => {
      // Convert MySQL style placeholders or AUTO_INCREMENT if necessary, but standard SQL parameter binding works
      // Convert named parameters or ? placeholders
      const lowerSql = sql.trim().toLowerCase();
      if (lowerSql.startsWith('select')) {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        sqliteDb.run(sql, params, function (err) {
          if (err) reject(err);
          else {
            resolve({ insertId: this.lastID, affectedRows: this.changes });
          }
        });
      }
    });
  } else {
    throw new Error('Database not initialized');
  }
};

export const initDB = async () => {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'smart_light_db';
  const dbPort = process.env.DB_PORT || 3306;

  try {
    console.log(`Attempting MySQL connection to ${dbHost}:${dbPort}/${dbName}...`);
    pool = mysql.createPool({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      port: dbPort,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database!');
    connection.release();
    dbType = 'mysql';
    await ensureMySQLCreditSchema();
  } catch (err) {
    console.warn(`MySQL connection failed (${err.message}). Falling back to embedded SQLite mode for seamless execution.`);
    dbType = 'sqlite';
    const dbPath = path.join(__dirname, '..', 'smart_light_db.sqlite');
    
    sqliteDb = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        console.error('Failed to open SQLite database:', err);
        return;
      }
      console.log(`Using SQLite database at ${dbPath}`);
      await setupSQLiteTables();
    });
  }
};

const setupSQLiteTables = () => {
  return new Promise((resolve, reject) => {
    sqliteDb.serialize(async () => {
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS Users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'citizen',
          phone TEXT,
          credit_points INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      sqliteDb.run('ALTER TABLE Users ADD COLUMN credit_points INTEGER NOT NULL DEFAULT 0', () => {});

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS StreetLights (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pole_number TEXT UNIQUE NOT NULL,
          area TEXT NOT NULL,
          status TEXT DEFAULT 'working',
          latitude REAL,
          longitude REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS Complaints (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          citizen_id INTEGER NOT NULL,
          pole_number TEXT NOT NULL,
          area TEXT NOT NULL,
          description TEXT NOT NULL,
          image_url TEXT,
          status TEXT DEFAULT 'Pending',
          assigned_staff_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (citizen_id) REFERENCES Users(id),
          FOREIGN KEY (assigned_staff_id) REFERENCES Users(id)
        )
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS Maintenance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          complaint_id INTEGER NOT NULL,
          staff_id INTEGER NOT NULL,
          repair_notes TEXT,
          repair_image_url TEXT,
          completed_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (complaint_id) REFERENCES Complaints(id),
          FOREIGN KEY (staff_id) REFERENCES Users(id)
        )
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS CreditHistory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          complaint_id INTEGER NOT NULL UNIQUE,
          staff_id INTEGER NOT NULL,
          points INTEGER NOT NULL DEFAULT 20,
          completed_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (complaint_id) REFERENCES Complaints(id),
          FOREIGN KEY (staff_id) REFERENCES Users(id)
        )
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS Feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          citizen_id INTEGER NOT NULL,
          subject TEXT NOT NULL DEFAULT 'General Feedback',
          message TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (citizen_id) REFERENCES Users(id)
        )
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS Notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          complaint_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          is_read INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Remove all non-admin users and demo data except admin madhang285@gmail.com
      sqliteDb.run("DELETE FROM Users WHERE email != 'madhang285@gmail.com'");
      sqliteDb.run("DELETE FROM Complaints");
      sqliteDb.run("DELETE FROM Maintenance");
      sqliteDb.run("DELETE FROM CreditHistory");
      sqliteDb.run("DELETE FROM Feedback");
      sqliteDb.run("DELETE FROM Notifications");

      // Ensure Admin user madhang285@gmail.com exists
      sqliteDb.get("SELECT * FROM Users WHERE email = ?", ['madhang285@gmail.com'], async (err, row) => {
        const adminPass = await bcrypt.hash('123', 10);
        if (!row) {
          console.log("Setting up Admin user: madhang285@gmail.com");
          sqliteDb.run("INSERT INTO Users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)",
            ['Admin', 'madhang285@gmail.com', adminPass, 'admin', '9876543210']);
        } else {
          sqliteDb.run("UPDATE Users SET password = ?, role = 'admin' WHERE email = ?", [adminPass, 'madhang285@gmail.com']);
        }
        console.log("Cleaned database: All non-admin users removed. Admin user madhang285@gmail.com active.");
        resolve();
      });
    });
  });
};

const ensureMySQLCreditSchema = async () => {
  try {
    await pool.query('ALTER TABLE Users ADD COLUMN credit_points INT NOT NULL DEFAULT 0');
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      throw error;
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS CreditHistory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      complaint_id INT NOT NULL UNIQUE,
      staff_id INT NOT NULL,
      points INT NOT NULL DEFAULT 20,
      completed_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES Complaints(id) ON DELETE CASCADE,
      FOREIGN KEY (staff_id) REFERENCES Users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    ALTER TABLE Complaints
    MODIFY COLUMN status ENUM('Pending', 'Accepted', 'Declined', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending'
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS Notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      complaint_id INT NOT NULL,
      title VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
      FOREIGN KEY (complaint_id) REFERENCES Complaints(id) ON DELETE CASCADE
    )
  `);
};

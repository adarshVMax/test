import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { CANDIDATES } from "./data.js";

dotenv.config();

const {
  DB_HOST = "localhost",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "faith_voting",
} = process.env;

let pool;

// Creates the database (if missing), all tables, and seeds candidates once.
export async function initDb() {
  // Step 1: connect without a database so we can create it if needed.
  const root = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  await root.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await root.end();

  // Step 2: pooled connection to the actual database.
  pool = mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS candidates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      category ENUM('head_boy','head_girl','house_leader') NOT NULL,
      house VARCHAR(40) DEFAULT NULL,
      photo TEXT NOT NULL
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS voters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      roll_number VARCHAR(60) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_roll (roll_number)
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      voter_id INT NOT NULL,
      candidate_id INT NOT NULL,
      category ENUM('head_boy','head_girl','house_leader') NOT NULL,
      house VARCHAR(40) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (voter_id) REFERENCES voters(id) ON DELETE CASCADE,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // Step 3: seed candidates only if the table is empty.
  const [[{ count }]] = await pool.query(
    "SELECT COUNT(*) AS count FROM candidates"
  );
  if (count === 0) {
    const values = CANDIDATES.map((c) => [c.name, c.category, c.house, c.photo]);
    await pool.query(
      "INSERT INTO candidates (name, category, house, photo) VALUES ?",
      [values]
    );
    console.log(`Seeded ${CANDIDATES.length} candidates.`);
  }

  return pool;
}

export function getPool() {
  if (!pool) throw new Error("Database not initialized. Call initDb() first.");
  return pool;
}

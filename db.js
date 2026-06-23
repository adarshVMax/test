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
      category VARCHAR(40) NOT NULL,
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
      category VARCHAR(40) NOT NULL,
      house VARCHAR(40) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (voter_id) REFERENCES voters(id) ON DELETE CASCADE,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // Migrate older databases that used an ENUM for `category`.
  try {
    await pool.query("ALTER TABLE candidates MODIFY category VARCHAR(40) NOT NULL");
    await pool.query("ALTER TABLE votes MODIFY category VARCHAR(40) NOT NULL");
  } catch (e) {
    console.warn("Category column migration skipped:", e.message);
  }

  // Step 3: seed candidates, and re-seed if the data set has changed.
  const [existing] = await pool.query(
    "SELECT name, category, house, photo FROM candidates ORDER BY id"
  );

  const signature = (list) =>
    JSON.stringify(
      list
        .map((c) => `${c.name}|${c.category}|${c.house || ""}|${c.photo}`)
        .sort()
    );

  if (signature(existing) !== signature(CANDIDATES)) {
    // Candidates changed (new roles/names/photos): rebuild the candidate set.
    // Existing (test) votes and voters are cleared for an accurate fresh count.
    await pool.query("DELETE FROM votes");
    await pool.query("DELETE FROM voters");
    await pool.query("DELETE FROM candidates");
    const values = CANDIDATES.map((c) => [c.name, c.category, c.house, c.photo]);
    await pool.query(
      "INSERT INTO candidates (name, category, house, photo) VALUES ?",
      [values]
    );
    console.log(`Seeded ${CANDIDATES.length} candidates (data set updated).`);
  }

  return pool;
}

export function getPool() {
  if (!pool) throw new Error("Database not initialized. Call initDb() first.");
  return pool;
}

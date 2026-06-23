import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb, getPool } from "./db.js";
import { HOUSES } from "./data.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// --- Public: candidates grouped for the voting flow ---
app.get("/api/candidates", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, name, category, house, photo FROM candidates ORDER BY id"
    );

    const headBoy = rows.filter((r) => r.category === "head_boy");
    const headGirl = rows.filter((r) => r.category === "head_girl");
    const disciplineLeader = rows.filter((r) => r.category === "discipline_leader");
    const sportsMentor = rows.filter((r) => r.category === "sports_mentor");
    const houses = HOUSES.map((h) => ({
      ...h,
      candidates: rows.filter(
        (r) => r.category === "house_leader" && r.house === h.key
      ),
    }));

    res.json({ headBoy, headGirl, disciplineLeader, sportsMentor, houses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load candidates." });
  }
});

// --- Public: submit a completed ballot ---
// body: { selections: { head_boy, head_girl, discipline_leader, sports_mentor, house, houseLeader } }
// name / rollNumber are optional (voting is anonymous for the kids' flow).
app.post("/api/vote", async (req, res) => {
  const pool = getPool();
  const { name, rollNumber, selections } = req.body || {};

  if (!selections) {
    return res.status(400).json({ error: "Missing selections." });
  }
  const { head_boy, head_girl, discipline_leader, sports_mentor, house, houseLeader } = selections;
  if (!head_boy || !head_girl) {
    return res.status(400).json({ error: "Head Boy and Head Girl votes are required." });
  }
  if (!discipline_leader) {
    return res.status(400).json({ error: "A Discipline Leader vote is required." });
  }
  if (!sports_mentor) {
    return res.status(400).json({ error: "A Sports Mentor vote is required." });
  }
  if (!house || !HOUSES.some((h) => h.key === house)) {
    return res.status(400).json({ error: "Please select a valid house." });
  }
  if (!houseLeader) {
    return res.status(400).json({ error: "A leader must be chosen for your house." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const finalName = (name && name.trim()) || "Anonymous";
    // If a roll number is provided, keep the one-vote-per-roll rule.
    let finalRoll;
    if (rollNumber && String(rollNumber).trim()) {
      finalRoll = String(rollNumber).trim();
      const [existing] = await conn.query(
        "SELECT id FROM voters WHERE roll_number = ?",
        [finalRoll]
      );
      if (existing.length > 0) {
        await conn.rollback();
        return res.status(409).json({ error: "This roll number has already voted." });
      }
    } else {
      // Anonymous voter: generate a unique placeholder roll.
      finalRoll = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    const [voterResult] = await conn.query(
      "INSERT INTO voters (name, roll_number) VALUES (?, ?)",
      [finalName, finalRoll]
    );
    const voterId = voterResult.insertId;

    const voteRows = [
      [voterId, head_boy, "head_boy", null],
      [voterId, head_girl, "head_girl", null],
      [voterId, discipline_leader, "discipline_leader", null],
      [voterId, sports_mentor, "sports_mentor", null],
      [voterId, houseLeader, "house_leader", house],
    ];

    await conn.query(
      "INSERT INTO votes (voter_id, candidate_id, category, house) VALUES ?",
      [voteRows]
    );

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to record vote." });
  } finally {
    conn.release();
  }
});

// --- Admin: login ---
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.json({ ok: true, token: "faith-admin" });
  }
  res.status(401).json({ error: "Invalid credentials." });
});

// --- Admin: results with vote counts ---
app.get("/api/admin/results", async (req, res) => {
  if (req.headers.authorization !== "Bearer faith-admin") {
    return res.status(401).json({ error: "Unauthorized." });
  }
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT c.id, c.name, c.category, c.house, c.photo,
             COUNT(v.id) AS votes
      FROM candidates c
      LEFT JOIN votes v ON v.candidate_id = c.id
      GROUP BY c.id
      ORDER BY c.category, c.house, votes DESC
    `);
    const [[{ totalVoters }]] = await pool.query(
      "SELECT COUNT(*) AS totalVoters FROM voters"
    );

    const headBoy = rows.filter((r) => r.category === "head_boy");
    const headGirl = rows.filter((r) => r.category === "head_girl");
    const disciplineLeader = rows.filter((r) => r.category === "discipline_leader");
    const sportsMentor = rows.filter((r) => r.category === "sports_mentor");
    const houses = HOUSES.map((h) => ({
      ...h,
      candidates: rows.filter(
        (r) => r.category === "house_leader" && r.house === h.key
      ),
    }));

    res.json({ totalVoters, headBoy, headGirl, disciplineLeader, sportsMentor, houses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load results." });
  }
});

// --- Admin: reset all votes (clears votes + voters, keeps candidates) ---
app.post("/api/admin/reset", async (req, res) => {
  if (req.headers.authorization !== "Bearer faith-admin") {
    return res.status(401).json({ error: "Unauthorized." });
  }
  try {
    const pool = getPool();
    await pool.query("DELETE FROM votes");
    await pool.query("DELETE FROM voters");
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset voting." });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

initDb()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Voting backend running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err.message);
    console.error(
      "Make sure MySQL is running and credentials in .env are correct."
    );
    process.exit(1);
  });

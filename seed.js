// Standalone seeding helper: initializes the database and exits.
import { initDb } from "./db.js";

initDb()
  .then(() => {
    console.log("Database initialized and seeded.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  });

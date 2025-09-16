// server/src/db/client.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase
});

// Test the connection at startup
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Connected to Supabase Postgres");
  } catch (err) {
    console.error("Database connection error:", err);
  }
})();

export default pool;

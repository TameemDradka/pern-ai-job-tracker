import { Router } from "express";
import jwt from "jsonwebtoken";
import pool from "../db/client.js";
import auth from "../middleware/auth.js";

// Try to import native bcrypt, fall back to bcryptjs if not available
let bcryptLib;
try {
  // eslint-disable-next-line n/no-missing-import
  bcryptLib = await import("bcrypt");
  bcryptLib = bcryptLib.default || bcryptLib;
} catch {
  bcryptLib = await import("bcryptjs");
  bcryptLib = bcryptLib.default || bcryptLib;
}

const router = Router();

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  // simple RFC5322-like check
  return /.+@.+\..+/.test(email);
}

// POST /auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const saltRounds = 10;
    let passwordHash;
    try {
      passwordHash = await bcryptLib.hash(password, saltRounds);
    } catch (err) {
      return res.status(500).json({ error: "Failed to hash password" });
    }

    // Insert user; assume a table users(id SERIAL/BIGSERIAL PK, email TEXT UNIQUE, password_hash TEXT)
    const insertSQL = `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email
    `;
    let inserted;
    try {
      const result = await pool.query(insertSQL, [email, passwordHash]);
      inserted = result.rows[0];
    } catch (err) {
      return next(err);
    }

    if (!inserted) {
      return res.status(409).json({ error: "Email already registered" });
    }

    return res.status(201).json(inserted);
  } catch (err) {
    return next(err);
  }
});

// POST /auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!isValidEmail(email) || typeof password !== "string") {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Fetch user by email
    const selectSQL = `SELECT id, email, password_hash FROM users WHERE email = $1`;
    let user;
    try {
      const result = await pool.query(selectSQL, [email]);
      user = result.rows[0];
    } catch (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    let ok = false;
    try {
      ok = await bcryptLib.compare(password, user.password_hash);
    } catch {
      ok = false;
    }
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      const err = new Error("JWT secret not configured");
      err.status = 500;
      return next(err);
    }
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: "7d" });
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

// Protected: GET /auth/me — returns current user's basic profile
router.get("/me", auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, email FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    return res.json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

export default router;

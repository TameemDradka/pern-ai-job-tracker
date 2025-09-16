import { Router } from "express";
import jwt from "jsonwebtoken";
import pool from "../db/client.js";
import auth from "../middleware/auth.js";
import {
  badRequest,
  unauthorized as unauthorizedErr,
  notFound,
} from "../middleware/error.js";

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
      throw badRequest("Invalid email");
    }
    if (typeof password !== "string" || password.length < 8) {
      throw badRequest("Password must be at least 8 characters");
    }

    const saltRounds = 10;
    let passwordHash;
    try {
      passwordHash = await bcryptLib.hash(password, saltRounds);
    } catch (err) {
      return next(err);
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
      const e = new Error("Email already registered");
      e.status = 409;
      e.code = "CONFLICT";
      throw e;
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
      throw badRequest("Invalid credentials");
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
      throw unauthorizedErr("Invalid email or password");
    }

    let ok = false;
    try {
      ok = await bcryptLib.compare(password, user.password_hash);
    } catch {
      ok = false;
    }
    if (!ok) {
      throw unauthorizedErr("Invalid email or password");
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
    if (!rows[0]) return next(notFound("User not found"));
    return res.json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

export default router;

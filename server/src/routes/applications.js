import { Router } from "express";
import pool from "../db/client.js";
import auth from "../middleware/auth.js";
import { badRequest, notFound } from "../middleware/error.js";

const router = Router();

// All routes require auth
router.use(auth);

// GET /applications -> current user's applications ordered by applied_at desc
router.get("/", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      `SELECT id, user_id, company, role, link, notes, status, applied_at
       FROM applications
       WHERE user_id = $1
       ORDER BY applied_at DESC`,
      [userId]
    );
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

// POST /applications -> create new application
router.post("/", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { company, role, link = null, notes = null } = req.body || {};

    if (
      !company ||
      !role ||
      typeof company !== "string" ||
      typeof role !== "string"
    ) {
      throw badRequest("company and role are required");
    }

    const insertSQL = `
      INSERT INTO applications (user_id, company, role, link, notes, status, applied_at)
      VALUES ($1, $2, $3, $4, $5, 'applied', NOW())
      RETURNING id, user_id, company, role, link, notes, status, applied_at
    `;
    const params = [userId, company.trim(), role.trim(), link, notes];
    const { rows } = await pool.query(insertSQL, params);
    return res.status(201).json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

// PATCH /applications/:id/status -> update status
router.patch("/:id/status", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const { status } = req.body || {};

    const allowed = new Set(["applied", "interview", "offer", "rejected"]);
    if (!allowed.has(status)) {
      throw badRequest("Invalid status");
    }

    const updateSQL = `
      UPDATE applications
      SET status = $1
      WHERE id = $2 AND user_id = $3
      RETURNING id, user_id, company, role, link, notes, status, applied_at
    `;
    const { rows } = await pool.query(updateSQL, [status, id, userId]);
    if (!rows[0]) return next(notFound());
    return res.json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

// DELETE /applications/:id -> delete if owned
router.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const delSQL = `DELETE FROM applications WHERE id = $1 AND user_id = $2`;
    const result = await pool.query(delSQL, [id, userId]);
    if (result.rowCount === 0) return next(notFound());
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

export default router;

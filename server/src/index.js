import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Import the DB client so the connection self-test runs
import "./db/client.js";

// (You can wire real routers later)
import authRouter from "./routes/auth.js";
import applicationsRouter from "./routes/applications.js";
import aiRouter from "./routes/ai.js";

const app = express();
const PORT = process.env.PORT || 3000;
const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// Core middleware
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: ORIGIN }));

// Rate limit sensitive routes (tune later)
const limiter = rateLimit({ windowMs: 60_000, limit: 60 });
app.use("/auth", limiter);
app.use("/ai", limiter);

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// Mount routers (keep even if they’re basic stubs for now)
app.use("/auth", authRouter);
app.use("/applications", applicationsRouter);
app.use("/ai", aiRouter);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Centralized error handler (ensure JSON shape)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ error: message });
});

// Start
app.listen(PORT, () => {
  const env = process.env.NODE_ENV || "development";
  console.log(
    `API listening on http://localhost:${PORT} (env=${env}, CORS_ORIGIN=${ORIGIN})`
  );
});

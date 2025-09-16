import jwt from "jsonwebtoken";
import { unauthorized } from "./error.js";

// JWT auth middleware
// - Reads Authorization: Bearer <token>
// - Verifies using process.env.JWT_SECRET
// - On success: sets req.user = { id }
// - On failure: 401 with JSON error
export default function auth(req, res, next) {
  try {
    const header = req.headers["authorization"] || req.get("Authorization");
    if (!header || typeof header !== "string") {
      throw unauthorized("Missing Authorization header");
    }

    const [scheme, token] = header.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) {
      throw unauthorized("Invalid Authorization header format");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      const err = new Error("JWT secret not configured");
      err.status = 500;
      return next(err);
    }

    let payload;
    try {
      payload = jwt.verify(token.trim(), secret);
    } catch (err) {
      throw unauthorized("Invalid or expired token");
    }

    const id = payload && (payload.id ?? payload.userId ?? payload.sub);
    if (!id) {
      throw unauthorized("Token missing user id");
    }

    req.user = { id };
    return next();
  } catch (err) {
    // Unexpected error — forward to centralized error handler
    return next(err);
  }
}

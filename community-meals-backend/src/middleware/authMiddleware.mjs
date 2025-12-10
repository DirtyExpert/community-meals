// src/middleware/authMiddleware.mjs
// Middleware to require a valid JWT and attach user to req.user.

import { getUserFromToken } from "../services/authService.mjs";

export function authRequired(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const user = getUserFromToken(token);

  if (!user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = user;
  next();
}

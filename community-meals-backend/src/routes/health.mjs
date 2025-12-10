// src/routes/health.mjs
// Simple health check route for the API

import { Router } from "express";

const router = Router();

/**
 * GET /health
 * Basic health check endpoint.
 *
 * Example response:
 * {
 *   "status": "ok",
 *   "uptime": 123.456,
 *   "timestamp": "2025-12-10T01:23:45.678Z"
 * }
 */
router.get("/", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;

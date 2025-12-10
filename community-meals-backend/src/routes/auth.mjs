// src/routes/auth.mjs
// Routes for authentication: register and login.

import { Router } from "express";
import { handleRegister, handleLogin } from "../controllers/authController.mjs";

const router = Router();

/**
 * Temporary debug route:
 * GET /auth/debug
 * This should respond if the auth router is correctly mounted.
 */
router.get("/debug", (req, res) => {
  res.json({ message: "auth router is alive" });
});

/**
 * POST /auth/register
 * Body: { name, email, password, role, zip }
 */
router.post("/register", handleRegister);

/**
 * POST /auth/login
 * Body: { email, password }
 */
router.post("/login", handleLogin);

export default router;

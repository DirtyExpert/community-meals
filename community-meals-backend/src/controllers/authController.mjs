// src/controllers/authController.mjs
// Express route handlers for auth.

import { registerUser, loginUser } from "../services/authService.mjs";

export async function handleRegister(req, res, next) {
  try {
    const { name, email, password, role, zip } = req.body;

    const result = await registerUser({ name, email, password, role, zip });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

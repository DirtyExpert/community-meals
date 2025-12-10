// src/services/authService.mjs
// Core business logic for authentication.

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  findUserById,
  toSafeUser
} from "../db/models/User.mjs";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

/**
 * Register a new user.
 */
export async function registerUser({ name, email, password, role, zip }) {
  if (!name || !email || !password || !role || !zip) {
    const err = new Error("Missing required fields");
    err.status = 400;
    throw err;
  }

  // MVP: limit to 93230 zip for now
  if (zip !== "93230") {
    const err = new Error("For this pilot, only zip 93230 is supported");
    err.status = 400;
    throw err;
  }

  const existing = findUserByEmail(email);
  if (existing) {
    const err = new Error("Email is already registered");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = createUser({
    name,
    email,
    passwordHash,
    role,
    zip
  });

  const token = createTokenForUser(user);

  return {
    user: toSafeUser(user),
    token
  };
}

/**
 * Login an existing user.
 */
export async function loginUser({ email, password }) {
  if (!email || !password) {
    const err = new Error("Email and password are required");
    err.status = 400;
    throw err;
  }

  const user = findUserByEmail(email);
  if (!user) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const token = createTokenForUser(user);

  return {
    user: toSafeUser(user),
    token
  };
}

/**
 * Verify a JWT and return the corresponding user, or null.
 */
export function getUserFromToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.userId) return null;

    const user = findUserById(decoded.userId);
    return toSafeUser(user);
  } catch (e) {
    return null;
  }
}

/**
 * Internal helper to sign a token for a user.
 */
function createTokenForUser(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

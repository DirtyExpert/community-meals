// src/db/models/User.mjs
// User model helpers using the in-memory db.

import db, { generateId } from "../index.mjs";

/**
 * Create a new user record.
 * @param {Object} data - { name, email, passwordHash, role, zip }
 */
export function createUser({ name, email, passwordHash, role, zip }) {
  const now = new Date().toISOString();
  const user = {
    id: generateId("user"),
    name,
    email,
    passwordHash,
    role,
    zip,
    createdAt: now,
    updatedAt: now
  };

  db.users.push(user);
  return user;
}

/**
 * Find a user by email.
 */
export function findUserByEmail(email) {
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Find a user by id.
 */
export function findUserById(id) {
  return db.users.find((u) => u.id === id) || null;
}

/**
 * Return a "safe" user object without the passwordHash.
 */
export function toSafeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

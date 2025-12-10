// src/db/models/Reservation.mjs
// Reservation model helpers using the in-memory db.

import db, { generateId } from "../index.mjs";

/**
 * Create a new reservation.
 */
export function createReservation({ userId, mealId, servings, status }) {
  const now = new Date().toISOString();
  const reservation = {
    id: generateId("resv"),
    userId,
    mealId,
    servings,
    status, // "confirmed" | "completed" | "cancelled"
    createdAt: now,
    updatedAt: now
  };

  db.reservations.push(reservation);
  return reservation;
}

/**
 * Find reservation by ID.
 */
export function findReservationById(id) {
  return db.reservations.find((r) => r.id === id) || null;
}

/**
 * List reservations for a user.
 */
export function listReservationsByUser(userId) {
  return db.reservations.filter((r) => r.userId === userId);
}

/**
 * List reservations for a meal.
 */
export function listReservationsByMeal(mealId) {
  return db.reservations.filter((r) => r.mealId === mealId);
}

/**
 * Update reservation fields (currently just status).
 */
export function updateReservation(reservation, updates) {
  const allowedFields = ["status"];

  let changed = false;
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      reservation[key] = updates[key];
      changed = true;
    }
  }

  if (changed) {
    reservation.updatedAt = new Date().toISOString();
  }

  return reservation;
}

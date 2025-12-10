// src/services/reservationsService.mjs
// Business logic for reservations.

import {
  createReservation,
  findReservationById,
  listReservationsByUser,
  listReservationsByMeal,
  updateReservation
} from "../db/models/Reservation.mjs";

import {
  findMealById,
  decreaseServingsAvailable,
  increaseServingsAvailable
} from "../db/models/Meal.mjs";

/**
 * Create a reservation for a meal by a user.
 */
export function createReservationForUser(user, mealId, payload) {
  const { servings } = payload;

  const servingsNum = Number(servings);
  if (!Number.isFinite(servingsNum) || servingsNum < 1) {
    const err = new Error("servings must be a number >= 1");
    err.status = 400;
    throw err;
  }

  const meal = findMealById(mealId);
  if (!meal) {
    const err = new Error("Meal not found");
    err.status = 404;
    throw err;
  }

  if (meal.status !== "open") {
    const err = new Error("Meal is not open for reservations");
    err.status = 400;
    throw err;
  }

  if (meal.servingsAvailable < servingsNum) {
    const err = new Error("Not enough servings available");
    err.status = 400;
    throw err;
  }

  // For MVP: auto-confirm reservations
  const reservation = createReservation({
    userId: user.id,
    mealId: meal.id,
    servings: servingsNum,
    status: "confirmed"
  });

  decreaseServingsAvailable(meal, servingsNum);

  return reservation;
}

/**
 * List reservations for the current user.
 */
export function getReservationsForUser(user) {
  return listReservationsByUser(user.id);
}

/**
 * List reservations for a given meal (cook only).
 */
export function getReservationsForMealForCook(user, mealId) {
  const meal = findMealById(mealId);
  if (!meal) {
    const err = new Error("Meal not found");
    err.status = 404;
    throw err;
  }

  if (meal.userId !== user.id) {
    const err = new Error("You do not have permission to view reservations for this meal");
    err.status = 403;
    throw err;
  }

  return listReservationsByMeal(meal.id);
}

/**
 * Update reservation status.
 * - Diner can cancel their own reservation.
 * - Cook can confirm/complete/cancel reservations on their meals.
 */
export function updateReservationStatusForUser(user, reservationId, newStatus) {
  const allowedStatuses = ["confirmed", "completed", "cancelled"];
  if (!allowedStatuses.includes(newStatus)) {
    const err = new Error(`Invalid status. Allowed: ${allowedStatuses.join(", ")}`);
    err.status = 400;
    throw err;
  }

  const reservation = findReservationById(reservationId);
  if (!reservation) {
    const err = new Error("Reservation not found");
    err.status = 404;
    throw err;
  }

  const meal = findMealById(reservation.mealId);
  if (!meal) {
    const err = new Error("Meal not found");
    err.status = 404;
    throw err;
  }

  const isDiner = reservation.userId === user.id;
  const isCook = meal.userId === user.id;

  if (!isDiner && !isCook) {
    const err = new Error("You do not have permission to update this reservation");
    err.status = 403;
    throw err;
  }

  const oldStatus = reservation.status;

  // Diner can only cancel their own reservation
  if (isDiner && newStatus !== "cancelled") {
    const err = new Error("Diner can only cancel their reservation");
    err.status = 403;
    throw err;
  }

  // Cook can move between confirmed/completed/cancelled
  // No extra rules here for MVP.
  updateReservation(reservation, { status: newStatus });

  // If cancellation of a previously confirmed reservation, restore servingsAvailable.
  if (oldStatus === "confirmed" && newStatus === "cancelled") {
    increaseServingsAvailable(meal, reservation.servings);
  }

  return reservation;
}

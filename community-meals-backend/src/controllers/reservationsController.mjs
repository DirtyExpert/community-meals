// src/controllers/reservationsController.mjs
// Express handlers for reservations.

import {
  createReservationForUser,
  getReservationsForUser,
  getReservationsForMealForCook,
  updateReservationStatusForUser
} from "../services/reservationsService.mjs";

export function handleCreateReservationForMeal(req, res, next) {
  try {
    const { id: mealId } = req.params;
    const reservation = createReservationForUser(req.user, mealId, req.body);
    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
}

export function handleListReservationsForMeal(req, res, next) {
  try {
    const { id: mealId } = req.params;
    const reservations = getReservationsForMealForCook(req.user, mealId);
    res.json(reservations);
  } catch (err) {
    next(err);
  }
}

export function handleListMyReservations(req, res, next) {
  try {
    const reservations = getReservationsForUser(req.user);
    res.json(reservations);
  } catch (err) {
    next(err);
  }
}

export function handleUpdateReservation(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = updateReservationStatusForUser(req.user, id, status);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

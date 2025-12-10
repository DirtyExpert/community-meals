// src/routes/meals.mjs
// Routes for meals: create, list, get, update, plus meal-specific reservations.

import { Router } from "express";
import {
  handleCreateMeal,
  handleListMeals,
  handleGetMeal,
  handleListMyMeals,
  handleUpdateMeal
} from "../controllers/mealsController.mjs";
import {
  handleCreateReservationForMeal,
  handleListReservationsForMeal
} from "../controllers/reservationsController.mjs";
import { authRequired } from "../middleware/authMiddleware.mjs";

const router = Router();

/**
 * GET /meals
 * Public list of meals with filters (zip, from, freeOnly)
 */
router.get("/", handleListMeals);

/**
 * GET /meals/mine
 * List meals created by the authenticated user.
 */
router.get("/mine", authRequired, handleListMyMeals);

/**
 * POST /meals
 * Create a meal (auth required).
 */
router.post("/", authRequired, handleCreateMeal);

/**
 * GET /meals/:id
 * Get a specific meal by ID.
 */
router.get("/:id", handleGetMeal);

/**
 * POST /meals/:id/reservations
 * Create a reservation for this meal (auth required).
 */
router.post("/:id/reservations", authRequired, handleCreateReservationForMeal);

/**
 * GET /meals/:id/reservations
 * List reservations for this meal (cook only).
 */
router.get("/:id/reservations", authRequired, handleListReservationsForMeal);

export default router;

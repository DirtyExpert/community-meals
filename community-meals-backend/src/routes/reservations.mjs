// src/routes/reservations.mjs
// Routes for reservations not tied to a specific meal path.

import { Router } from "express";
import {
  handleListMyReservations,
  handleUpdateReservation
} from "../controllers/reservationsController.mjs";
import { authRequired } from "../middleware/authMiddleware.mjs";

const router = Router();

/**
 * GET /reservations/mine
 * List reservations made by the authenticated user.
 */
router.get("/mine", authRequired, handleListMyReservations);

/**
 * PATCH /reservations/:id
 * Update reservation status.
 * - Diner: can cancel their own
 * - Cook: can confirm/complete/cancel on their meals
 */
router.patch("/:id", authRequired, handleUpdateReservation);

export default router;

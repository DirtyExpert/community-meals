// src/services/mealsService.mjs
// Business logic for meals.

import {
  createMeal,
  findMealById,
  listMeals,
  listMealsByUser,
  updateMeal
} from "../db/models/Meal.mjs";

/**
 * Create a meal for a given user.
 */
export function createMealForUser(user, payload) {
  const {
    title,
    description,
    tags,
    costPerServing,
    servingsTotal,
    readyAt
  } = payload;

  if (!title || !description || servingsTotal == null || costPerServing == null || !readyAt) {
    const err = new Error("Missing required fields: title, description, servingsTotal, costPerServing, readyAt");
    err.status = 400;
    throw err;
  }

  const servingsNum = Number(servingsTotal);
  const costNum = Number(costPerServing);

  if (!Number.isFinite(servingsNum) || servingsNum < 1) {
    const err = new Error("servingsTotal must be a number >= 1");
    err.status = 400;
    throw err;
  }

  // No upper price cap: only enforce non-negative
  if (!Number.isFinite(costNum) || costNum < 0) {
    const err = new Error("costPerServing must be a non-negative number");
    err.status = 400;
    throw err;
  }

  // MVP: zip is taken from user; locked to 93230 by auth phase rules
  const zip = user.zip;

  const meal = createMeal({
    userId: user.id,
    title,
    description,
    tags,
    costPerServing: costNum,
    servingsTotal: servingsNum,
    readyAt,
    zip
  });

  return meal;
}

/**
 * Public list of meals with filters.
 */
export function getMeals(filters) {
  return listMeals(filters);
}

/**
 * Get a single meal by ID.
 */
export function getMealByIdOrThrow(id) {
  const meal = findMealById(id);
  if (!meal) {
    const err = new Error("Meal not found");
    err.status = 404;
    throw err;
  }
  return meal;
}

/**
 * Get meals for a specific user.
 */
export function getMealsForUser(user) {
  return listMealsByUser(user.id);
}

/**
 * Update a meal if the user owns it.
 */
export function updateMealForUser(user, mealId, updates) {
  const meal = findMealById(mealId);
  if (!meal) {
    const err = new Error("Meal not found");
    err.status = 404;
    throw err;
  }

  if (meal.userId !== user.id) {
    const err = new Error("You do not have permission to modify this meal");
    err.status = 403;
    throw err;
  }

  // Optional: validate updates (e.g., non-negative cost, status allowed values)
  const allowedStatus = ["open", "closed", "cancelled"];
  if (updates.status && !allowedStatus.includes(updates.status)) {
    const err = new Error(`Invalid status. Allowed: ${allowedStatus.join(", ")}`);
    err.status = 400;
    throw err;
  }

  if (updates.costPerServing != null) {
    const costNum = Number(updates.costPerServing);
    if (!Number.isFinite(costNum) || costNum < 0) {
      const err = new Error("costPerServing must be a non-negative number");
      err.status = 400;
      throw err;
    }
    updates.costPerServing = costNum;
  }

  if (updates.servingsTotal != null) {
    const servingsNum = Number(updates.servingsTotal);
    if (!Number.isFinite(servingsNum) || servingsNum < 1) {
      const err = new Error("servingsTotal must be a number >= 1");
      err.status = 400;
      throw err;
    }
    updates.servingsTotal = servingsNum;
  }

  const updated = updateMeal(meal, updates);
  return updated;
}

// src/db/models/Meal.mjs
// Meal model helpers using the in-memory db.

import db, { generateId } from "../index.mjs";

/**
 * Create a new meal record for a user.
 */
export function createMeal({
  userId,
  title,
  description,
  tags,
  costPerServing,
  servingsTotal,
  readyAt,
  zip
}) {
  const now = new Date().toISOString();
  const meal = {
    id: generateId("meal"),
    userId,
    title,
    description,
    tags: Array.isArray(tags) ? tags : [],
    costPerServing,
    servingsTotal,
    servingsAvailable: servingsTotal,
    readyAt,
    zip,
    status: "open", // "open" | "closed" | "cancelled"
    createdAt: now,
    updatedAt: now
  };

  db.meals.push(meal);
  return meal;
}

/**
 * Find meal by ID.
 */
export function findMealById(id) {
  return db.meals.find((m) => m.id === id) || null;
}

/**
 * List meals with simple filters.
 * Filters:
 *  - zip (optional, default "93230")
 *  - from (optional ISO date string)
 *  - freeOnly (optional boolean)
 */
export function listMeals({ zip = "93230", from, freeOnly } = {}) {
  let results = db.meals.filter((m) => m.zip === zip && m.status === "open");

  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate.getTime())) {
      results = results.filter((m) => {
        const readyAtDate = new Date(m.readyAt);
        return !isNaN(readyAtDate.getTime()) && readyAtDate >= fromDate;
      });
    }
  }

  if (freeOnly) {
    results = results.filter((m) => m.costPerServing === 0);
  }

  return results;
}

/**
 * List meals created by a specific user.
 */
export function listMealsByUser(userId) {
  return db.meals.filter((m) => m.userId === userId);
}

/**
 * Update a meal by merging fields.
 */
export function updateMeal(meal, updates) {
  const allowedFields = [
    "title",
    "description",
    "tags",
    "costPerServing",
    "servingsTotal",
    "servingsAvailable",
    "readyAt",
    "status"
  ];

  let changed = false;
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      meal[key] = updates[key];
      changed = true;
    }
  }

  if (changed) {
    meal.updatedAt = new Date().toISOString();
  }

  return meal;
}

/**
 * Decrease servingsAvailable by a given count (never below 0).
 */
export function decreaseServingsAvailable(meal, count) {
  const delta = Number(count) || 0;
  if (delta <= 0) return meal;
  meal.servingsAvailable = Math.max(0, meal.servingsAvailable - delta);
  meal.updatedAt = new Date().toISOString();
  return meal;
}

/**
 * Increase servingsAvailable by a given count.
 * Does NOT enforce an upper cap vs servingsTotal in this MVP.
 */
export function increaseServingsAvailable(meal, count) {
  const delta = Number(count) || 0;
  if (delta <= 0) return meal;
  meal.servingsAvailable = meal.servingsAvailable + delta;
  meal.updatedAt = new Date().toISOString();
  return meal;
}

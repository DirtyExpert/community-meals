// src/controllers/mealsController.mjs
// Express handlers for meals.

import {
  createMealForUser,
  getMeals,
  getMealByIdOrThrow,
  getMealsForUser,
  updateMealForUser
} from "../services/mealsService.mjs";

export function handleCreateMeal(req, res, next) {
  try {
    const meal = createMealForUser(req.user, req.body);
    res.status(201).json(meal);
  } catch (err) {
    next(err);
  }
}

export function handleListMeals(req, res, next) {
  try {
    const { zip, from, freeOnly } = req.query;
    const filters = {
      zip: zip || undefined,
      from: from || undefined,
      freeOnly: freeOnly === "true" || freeOnly === true
    };

    const meals = getMeals(filters);
    res.json(meals);
  } catch (err) {
    next(err);
  }
}

export function handleGetMeal(req, res, next) {
  try {
    const { id } = req.params;
    const meal = getMealByIdOrThrow(id);
    res.json(meal);
  } catch (err) {
    next(err);
  }
}

export function handleListMyMeals(req, res, next) {
  try {
    const meals = getMealsForUser(req.user);
    res.json(meals);
  } catch (err) {
    next(err);
  }
}

export function handleUpdateMeal(req, res, next) {
  try {
    const { id } = req.params;
    const updated = updateMealForUser(req.user, id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

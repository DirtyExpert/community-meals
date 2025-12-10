// src/api/meals.js
import { get, post } from "./client";

export async function fetchMeals() {
  return get("/meals");
}

export async function reserveMeal(mealId, servings, token) {
  return post(`/meals/${mealId}/reservations`, {
    body: { servings },
    token,
  });
}

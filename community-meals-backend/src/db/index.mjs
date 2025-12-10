// src/db/index.mjs
// Very simple in-memory "database" for MVP.
// NOTE: All data is lost when the server restarts.
// Later, this can be swapped for a real DB (Postgres, SQLite, etc.)

const db = {
  users: [],
  meals: [],
  reservations: []
};

let idCounter = 1;

/**
 * Generate a simple unique-ish ID for records.
 * Example: "user_1", "meal_2"
 */
export function generateId(prefix = "id") {
  return `${prefix}_${idCounter++}`;
}

export default db;

// community-meals-client/src/api/client.js

// Base URL for the backend API.
// You can override this with Vite env: VITE_API_BASE_URL
const API_BASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:4000";

const TOKEN_KEY = "cm_token";
const USER_KEY = "cm_user";

// --- Token helpers ---

export function getAuthToken() {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (typeof localStorage === "undefined") return;
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAuthToken() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

// --- User helpers (for convenience) ---

export function getStoredUser() {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (typeof localStorage === "undefined") return;
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

// --- Internal request helper ---

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // If no JSON body, that's fine; we'll still handle status below.
  }

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// --- Auth API ---

/**
 * Register a new user.
 * payload: { name, email, password, role("cook"|"diner"), zip("93230") }
 */
export async function registerUser(payload) {
  if (!payload || !payload.email || !payload.password) {
    throw new Error("registerUser requires at least email and password");
  }
  const data = await request("/auth/register", {
    method: "POST",
    body: payload,
  });

  // If backend returns token + user on register, store them.
  if (data && data.token) {
    setAuthToken(data.token);
  }
  if (data && data.user) {
    setStoredUser(data.user);
  }

  return data;
}

/**
 * Log in an existing user.
 * payload: { email, password } → { user, token }
 */
export async function loginUser(payload) {
  if (!payload || !payload.email || !payload.password) {
    throw new Error("loginUser requires email and password");
  }

  const data = await request("/auth/login", {
    method: "POST",
    body: payload,
  });

  if (!data || !data.token || !data.user) {
    throw new Error("Invalid login response from server");
  }

  setAuthToken(data.token);
  setStoredUser(data.user);

  return data;
}

// --- Meals API ---

/**
 * Get list of meals.
 * Optional filters: { zip, from, freeOnly }
 */
export async function getMeals(filters = {}) {
  const params = new URLSearchParams();

  if (filters.zip) params.set("zip", filters.zip);
  if (filters.from) params.set("from", filters.from);
  if (filters.freeOnly != null) params.set("freeOnly", String(filters.freeOnly));

  const qs = params.toString();
  const path = qs ? `/meals?${qs}` : "/meals";

  return request(path, { method: "GET" });
}

/**
 * Get meals belonging to the currently logged-in cook.
 */
export async function getMyMeals() {
  const data = await request("/meals/mine", {
    method: "GET",
    auth: true,
  });

  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.meals)) return data.meals;

  return [];
}

/**
 * Create a new meal as the current cook.
 * meal should contain:
 * - title
 * - description
 * - servingsTotal
 * - costPerServing
 * - readyAt (ISO string)
 */
export async function createMeal(meal) {
  if (!meal || !meal.title) {
    throw new Error("createMeal requires at least a title");
  }

  return request("/meals", {
    method: "POST",
    body: meal,
    auth: true,
  });
}

// --- Reservations API ---

/**
 * Create a reservation for a given meal.
 * Default servings is 1.
 */
export async function createReservation(mealId, servings = 1) {
  if (!mealId) {
    throw new Error("mealId is required to create a reservation");
  }

  const payload = {
    servings: servings == null ? 1 : servings,
  };

  return request(`/meals/${mealId}/reservations`, {
    method: "POST",
    body: payload,
    auth: true,
  });
}

/**
 * Get reservations for the currently logged-in user.
 * Normalizes different possible response shapes into an array.
 */
export async function getMyReservations() {
  const data = await request("/reservations/mine", {
    method: "GET",
    auth: true,
  });

  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.reservations)) return data.reservations;

  return [];
}

/**
 * Get reservations for a specific meal (as the cook).
 */
export async function getMealReservations(mealId) {
  if (!mealId) {
    throw new Error("mealId is required to load reservations for a meal");
  }

  const data = await request(`/meals/${mealId}/reservations`, {
    method: "GET",
    auth: true,
  });

  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.reservations)) return data.reservations;

  return [];
}

/**
 * Update reservation status (used by diners + cooks).
 * Example statuses: "pending", "confirmed", "picked_up", "cancelled".
 */
export async function updateReservationStatus(reservationId, status) {
  if (!reservationId) {
    throw new Error("reservationId is required to update a reservation");
  }
  if (!status) {
    throw new Error("status is required to update a reservation");
  }

  const payload = { status };

  return request(`/reservations/${reservationId}`, {
    method: "PATCH",
    body: payload,
    auth: true,
  });
}

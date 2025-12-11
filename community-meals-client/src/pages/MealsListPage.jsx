// community-meals-client/src/pages/MealsListPage.jsx

import { useEffect, useState } from "react";
import {
  getMeals,
  createMeal,
  loginUser,
  registerUser,
  getStoredUser,
  setStoredUser,
  clearAuthToken,
  clearStoredUser,
  createReservation,
} from "../api/client.js";

function formatDateTime(raw) {
  if (!raw) return "";
  try {
    return new Date(raw).toLocaleString();
  } catch {
    return raw;
  }
}

function formatCurrency(value) {
  if (value == null || isNaN(Number(value))) return "Free";
  const num = Number(value);
  if (num === 0) return "Free";
  return `$${num.toFixed(2)}`;
}

export default function MealsListPage() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Create-meal state
  const [title, setTitle] = useState("");
  const [hostName, setHostName] = useState("");
  const [location, setLocation] = useState("");
  const [readyDate, setReadyDate] = useState("");
  const [readyTime, setReadyTime] = useState("");
  const [servingsTotal, setServingsTotal] = useState("1");
  const [costPerServing, setCostPerServing] = useState("0");
  const [description, setDescription] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Meals list state
  const [meals, setMeals] = useState([]);
  const [mealsLoading, setMealsLoading] = useState(false);
  const [mealsError, setMealsError] = useState("");

  // Reservation feedback
  const [reserveMessage, setReserveMessage] = useState("");

  useEffect(() => {
    loadMeals();
  }, []);

  async function loadMeals() {
    setMealsLoading(true);
    setMealsError("");
    try {
      const data = await getMeals();
      setMeals(Array.isArray(data) ? data : []);
    } catch (err) {
      setMealsError(err?.message || "Could not load meals.");
    } finally {
      setMealsLoading(false);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError("");
    setReserveMessage("");
    setAuthLoading(true);

    try {
      // First, try login
      const loginResp = await loginUser({ email, password });
      setCurrentUser(loginResp.user);
      if (loginResp.user) {
        setStoredUser(loginResp.user);
        if (!name && loginResp.user.name) {
          setName(loginResp.user.name);
        }
      }
    } catch (loginErr) {
      // If login fails, attempt register as cook in 93230
      try {
        const regResp = await registerUser({
          name: name || email,
          email,
          password,
          role: "cook",
          zip: "93230",
        });
        setCurrentUser(regResp.user);
        if (regResp.user) {
          setStoredUser(regResp.user);
        }
      } catch (regErr) {
        setAuthError(
          regErr?.message || loginErr?.message || "Could not sign in or register."
        );
      }
    } finally {
      setAuthLoading(false);
    }
  }

  function handleSignOut() {
    clearAuthToken();
    clearStoredUser();
    setCurrentUser(null);
    setReserveMessage("");
  }

  function buildReadyAtISO() {
    // Date + time go to readyAt ISO
    if (!readyDate && !readyTime) {
      return new Date().toISOString();
    }
    if (!readyDate && readyTime) {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      return new Date(`${dateStr}T${readyTime}`).toISOString();
    }
    if (readyDate && !readyTime) {
      // Default to 6pm local if no time selected
      return new Date(`${readyDate}T18:00:00`).toISOString();
    }
    return new Date(`${readyDate}T${readyTime}`).toISOString();
  }

  async function handleCreateMeal(event) {
    event.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    setReserveMessage("");

    if (!currentUser) {
      setCreateError("You must be signed in as a cook to create meals.");
      return;
    }

    setCreateLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        servingsTotal: Number(servingsTotal) || 1,
        costPerServing: Number(costPerServing) || 0,
        readyAt: buildReadyAtISO(),
        // hostName and location aren't required by backend, but we include them.
        hostName: hostName.trim() || currentUser.name || "",
        location: location.trim(),
      };

      await createMeal(payload);
      setCreateSuccess("Meal created.");
      setTitle("");
      setHostName("");
      setLocation("");
      setReadyDate("");
      setReadyTime("");
      setServingsTotal("1");
      setCostPerServing("0");
      setDescription("");

      await loadMeals();
    } catch (err) {
      setCreateError(err?.message || "Could not create meal.");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleReserve(meal) {
    setReserveMessage("");

    if (!currentUser) {
      setReserveMessage("You must sign in as a diner/cook before reserving.");
      return;
    }

    const mealId = meal.id ?? meal._id ?? meal.mealId;
    if (!mealId) {
      setReserveMessage("Missing meal ID; cannot create reservation.");
      return;
    }

    try {
      await createReservation(mealId); // defaults to 1 serving
      setReserveMessage("Reservation created. Check My Reservations to see it.");
      await loadMeals();
    } catch (err) {
      setReserveMessage(err?.message || "Could not create reservation.");
    }
  }

  return (
    <div className="page page-meals">
      <div className="layout-grid">
        {/* Auth card */}
        <section className="card auth-card">
          <h2>Sign in / Join pilot</h2>

          {currentUser ? (
            <div className="signed-in">
              <p>
                Signed in as <strong>{currentUser.name || currentUser.email}</strong>
              </p>
              <p>
                Role: <code>{currentUser.role || "unknown"}</code>, ZIP{" "}
                <code>{currentUser.zip || "n/a"}</code>
              </p>
              <button type="button" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuthSubmit} className="auth-form">
              <div className="field">
                <label htmlFor="auth-name">Name</label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="field">
                <label htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {authError && <p className="error">{authError}</p>}

              <button type="submit" disabled={authLoading}>
                {authLoading ? "Working..." : "Sign in / Join"}
              </button>

              <p className="hint">
                We&apos;ll try to log you in first; if that fails, we&apos;ll
                register you as a cook in 93230.
              </p>
            </form>
          )}
        </section>

        {/* Create meal card */}
        <section className="card create-meal-card">
          <h2>Create a meal</h2>
          <p className="hint">
            Post a home-cooked meal for neighbors in 93230. This is a tiny pilot,
            so keep it simple.
          </p>

          <form onSubmit={handleCreateMeal} className="create-meal-form">
            <div className="field">
              <label htmlFor="meal-title">Title</label>
              <input
                id="meal-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Spaghetti & salad"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="meal-host">Cook / host name</label>
              <input
                id="meal-host"
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Your name or household name"
              />
            </div>

            <div className="field">
              <label htmlFor="meal-location">Location</label>
              <input
                id="meal-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Near 11th &amp; Grangeville"
              />
            </div>

            <div className="field-inline">
              <div className="field">
                <label htmlFor="meal-date">Date</label>
                <input
                  id="meal-date"
                  type="date"
                  value={readyDate}
                  onChange={(e) => setReadyDate(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="meal-time">Time</label>
                <input
                  id="meal-time"
                  type="time"
                  value={readyTime}
                  onChange={(e) => setReadyTime(e.target.value)}
                />
              </div>
            </div>

            <div className="field-inline">
              <div className="field">
                <label htmlFor="meal-servings">Servings (total)</label>
                <input
                  id="meal-servings"
                  type="number"
                  min="1"
                  value={servingsTotal}
                  onChange={(e) => setServingsTotal(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="meal-cost">Cost per serving ($)</label>
                <input
                  id="meal-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={costPerServing}
                  onChange={(e) => setCostPerServing(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="meal-description">Description</label>
              <textarea
                id="meal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Any details, dietary notes, etc."
                rows={3}
              />
            </div>

            {createError && <p className="error">{createError}</p>}
            {createSuccess && <p className="success">{createSuccess}</p>}

            <button type="submit" disabled={createLoading}>
              {createLoading ? "Posting..." : "Post meal"}
            </button>
          </form>
        </section>
      </div>

      {/* Meals list */}
      <section className="card meals-list-card">
        <h2>Available meals</h2>

        {mealsLoading && <p>Loading meals…</p>}
        {mealsError && <p className="error">{mealsError}</p>}

        {!mealsLoading && !mealsError && meals.length === 0 && (
          <p>No meals posted yet. Be the first to share something!</p>
        )}

        {reserveMessage && <p className="status">{reserveMessage}</p>}

        <ul className="meal-list">
          {meals.map((meal) => {
            const readyAt = formatDateTime(meal.readyAt);
            const availableRaw =
              meal.servingsAvailable ??
              meal.servings_remaining ??
              meal.servingsTotal;
            const available = Number.isFinite(Number(availableRaw))
              ? Number(availableRaw)
              : null;

            return (
              <li key={meal.id ?? meal._id}>
                <article className="meal-card">
                  <header>
                    <h3>{meal.title}</h3>
                    <p className="meal-meta">
                      <span>
                        {available != null
                          ? `${available} serving${
                              available === 1 ? "" : "s"
                            } available`
                          : "Servings info not available"}
                      </span>
                      <span> • </span>
                      <span>{formatCurrency(meal.costPerServing)}</span>
                    </p>
                  </header>

                  {meal.description && (
                    <p className="meal-description">{meal.description}</p>
                  )}

                  <p className="meal-details">
                    {meal.hostName && <span>Cook: {meal.hostName}</span>}
                    {meal.location && (
                      <>
                        <span> · </span>
                        <span>{meal.location}</span>
                      </>
                    )}
                    {readyAt && (
                      <>
                        <br />
                        <span>Ready at: {readyAt}</span>
                      </>
                    )}
                  </p>

                  <div className="meal-actions">
                    <button type="button" onClick={() => handleReserve(meal)}>
                      Reserve 1 serving
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

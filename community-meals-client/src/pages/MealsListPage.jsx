// community-meals-client/src/pages/MealsListPage.jsx

import { useEffect, useMemo, useRef, useState } from "react";
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

function getInitials(source) {
  const safe = (source || "").toString().trim();
  if (!safe) return "CM";
  const parts = safe.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
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

  // Refs for smooth scrolling from hero buttons
  const createSectionRef = useRef(null);
  const feedSectionRef = useRef(null);

  // Social “spotlight”s
  const spotlightMeal = useMemo(
    () => (meals && meals.length > 0 ? meals[0] : null),
    [meals]
  );
  const avatarMeals = useMemo(
    () => (meals && meals.length > 0 ? meals.slice(0, 5) : []),
    [meals]
  );

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
          regErr?.message ||
            loginErr?.message ||
            "Could not sign in or register."
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

      // Reset form
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

  function scrollToCreate() {
    if (createSectionRef.current) {
      createSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  function scrollToFeed() {
    if (feedSectionRef.current) {
      feedSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  const isCook = currentUser?.role === "cook";

  return (
    <div className="page">
      <h1>Tonight’s Community Table</h1>
      <p>
        Share extra home-cooked plates with neighbors in 93230. Cooks post
        meals, diners reserve a spot — simple and local.
      </p>

      {/* Auth + create meal side-by-side */}
      <div className="form-grid">
        {/* Auth panel */}
        <section className="panel">
          <h2>Sign in / Join pilot</h2>

          {currentUser ? (
            <>
              <p className="status">
                Signed in as{" "}
                <strong>{currentUser.name || currentUser.email}</strong>
              </p>
              <p className="hint">
                Role: <code>{currentUser.role || "unknown"}</code>, ZIP{" "}
                <code>{currentUser.zip || "n/a"}</code>
              </p>
              <button
                type="button"
                className="secondary small"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <form onSubmit={handleAuthSubmit}>
              <div>
                <label htmlFor="cm-name">Name</label>
                <input
                  id="cm-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div style={{ marginTop: "0.6rem" }}>
                <label htmlFor="cm-email">Email</label>
                <input
                  id="cm-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div style={{ marginTop: "0.6rem" }}>
                <label htmlFor="cm-password">Password</label>
                <input
                  id="cm-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {authError && <p className="error">{authError}</p>}

              <button
                type="submit"
                disabled={authLoading}
                style={{ marginTop: "0.8rem" }}
              >
                {authLoading ? "Working..." : "Sign in / Join"}
              </button>

              <p className="hint">
                We&apos;ll try to log you in first; if that fails, we&apos;ll
                register you as a cook in 93230.
              </p>
            </form>
          )}
        </section>

        {/* Create meal panel */}
        <section className="panel" ref={createSectionRef}>
          <h2>Create a meal</h2>
          <p className="hint">
            Post a home-cooked meal for neighbors in 93230. Keep it simple while
            we’re in pilot mode.
          </p>

          <form onSubmit={handleCreateMeal}>
            <div>
              <label htmlFor="cm-title">Title</label>
              <input
                id="cm-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Spaghetti & salad"
                required
              />
            </div>

            <div style={{ marginTop: "0.6rem" }}>
              <label htmlFor="cm-hostName">Cook / host name</label>
              <input
                id="cm-hostName"
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Your name or household name"
              />
            </div>

            <div style={{ marginTop: "0.6rem" }}>
              <label htmlFor="cm-location">Location</label>
              <input
                id="cm-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Near 11th & Grangeville"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                gap: "0.6rem",
                marginTop: "0.6rem",
              }}
            >
              <div>
                <label htmlFor="cm-readyDate">Date</label>
                <input
                  id="cm-readyDate"
                  type="date"
                  value={readyDate}
                  onChange={(e) => setReadyDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cm-readyTime">Time</label>
                <input
                  id="cm-readyTime"
                  type="time"
                  value={readyTime}
                  onChange={(e) => setReadyTime(e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                gap: "0.6rem",
                marginTop: "0.6rem",
              }}
            >
              <div>
                <label htmlFor="cm-servingsTotal">Servings (total)</label>
                <input
                  id="cm-servingsTotal"
                  type="number"
                  min="1"
                  value={servingsTotal}
                  onChange={(e) => setServingsTotal(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cm-costPerServing">Cost per serving ($)</label>
                <input
                  id="cm-costPerServing"
                  type="number"
                  min="0"
                  step="0.25"
                  value={costPerServing}
                  onChange={(e) => setCostPerServing(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: "0.6rem" }}>
              <label htmlFor="cm-description">Description</label>
              <textarea
                id="cm-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Any details, dietary notes, etc."
                rows={3}
              />
            </div>

            {createError && <p className="error">{createError}</p>}
            {createSuccess && <p className="status">{createSuccess}</p>}

            <button
              type="submit"
              disabled={createLoading}
              style={{ marginTop: "0.8rem" }}
            >
              {createLoading ? "Posting..." : "Post meal"}
            </button>
          </form>
        </section>
      </div>

      {/* NEW: Social-style “hero” landing after login */}
      <section className="panel hero-panel" ref={feedSectionRef}>
        <div className="hero-main">
          <p className="hero-kicker">
            {currentUser
              ? isCook
                ? "Cook dashboard · Pilot feed"
                : "Neighbor view · Pilot feed"
              : "Neighborhood feed · 93230 pilot"}
          </p>

          <h2>
            {currentUser
              ? "Post what you’re cooking, or scroll the feed below."
              : "See what your neighbors are cooking tonight."}
          </h2>

          <p className="hero-copy">
            Use this like a tiny social network for home-cooked food — quick
            posts, limited plates, real people in Hanford.
          </p>

          <div className="hero-cta-row">
            {currentUser ? (
              <>
                <button type="button" onClick={scrollToCreate}>
                  Post a new meal
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={scrollToFeed}
                >
                  Browse tonight’s meals
                </button>
              </>
            ) : (
              <span className="hero-note">
                Sign in above to unlock posting and reservations.
              </span>
            )}
          </div>

          <div className="avatar-row">
            {avatarMeals.map((meal) => (
              <div
                className="avatar-chip"
                key={meal.id ?? meal._id ?? meal.mealId}
              >
                <div className="avatar-circle">
                  {getInitials(meal.hostName || meal.title)}
                </div>
                <span className="avatar-label">
                  {meal.hostName || meal.title}
                </span>
              </div>
            ))}
            {meals.length > avatarMeals.length && (
              <span className="hero-count">
                + {meals.length - avatarMeals.length} more neighbors sharing
                plates
              </span>
            )}
            {meals.length === 0 && (
              <span className="hero-count">
                No meals posted yet. First cook to post becomes the star of the
                feed.
              </span>
            )}
          </div>
        </div>

        <div className="hero-spotlight">
          {spotlightMeal && (
            <article className="meal-item">
              <h3>{spotlightMeal.title}</h3>
              <p>
                {spotlightMeal.hostName && (
                  <>
                    Cook: <strong>{spotlightMeal.hostName}</strong>
                  </>
                )}
              </p>
              <p>
                {formatCurrency(spotlightMeal.costPerServing)} ·{" "}
                {formatDateTime(spotlightMeal.readyAt)}
              </p>
              {spotlightMeal.location && (
                <p>Near {spotlightMeal.location}</p>
              )}
            </article>
          )}
        </div>
      </section>

      {/* Feed / meals list */}
      <section className="panel" style={{ marginTop: "1.4rem" }}>
        <div className="feed-header">
          <h2>Available meals</h2>
          <span>
            {mealsLoading
              ? "Loading…"
              : meals.length === 0
              ? "No posts yet"
              : `${meals.length} meal${meals.length === 1 ? "" : "s"} live`}
          </span>
        </div>

        {mealsError && <p className="error">{mealsError}</p>}

        {!mealsLoading && !mealsError && meals.length === 0 && (
          <p className="hint">
            No meals posted yet. Be the first to share something!
          </p>
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
              <li
                key={meal.id ?? meal._id ?? meal.mealId}
                className="meal-item"
              >
                <h3>{meal.title}</h3>
                <p>
                  {available != null
                    ? `${available} serving${
                        available === 1 ? "" : "s"
                      } available`
                    : "Servings info not available"}
                  {" · "}
                  {formatCurrency(meal.costPerServing)}
                </p>
                {meal.description && <p>{meal.description}</p>}
                <p>
                  {meal.hostName && <span>Cook: {meal.hostName}</span>}
                  {meal.location && (
                    <>
                      {" · "}
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
                  <button
                    type="button"
                    className="small"
                    onClick={() => handleReserve(meal)}
                  >
                    Reserve 1 serving
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

// community-meals-client/src/pages/MyMealsPage.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAuthToken,
  getStoredUser,
  getMyMeals,
  getMealReservations,
  updateReservationStatus,
} from "../api/client.js";

function formatDateTime(raw) {
  if (!raw) return null;
  try {
    return new Date(raw).toLocaleString();
  } catch {
    return raw;
  }
}

function formatMoney(raw) {
  if (raw == null) return "Free";
  const num = Number(raw);
  if (Number.isNaN(num)) return String(raw);
  if (num === 0) return "Free";
  return `$${num.toFixed(2)}`;
}

function guessServings(reservation) {
  return (
    reservation.servings ??
    reservation.quantity ??
    reservation.count ??
    1
  );
}

function guessDinerName(res) {
  if (res.dinerName) return res.dinerName;
  if (res.diner && res.diner.name) return res.diner.name;
  if (res.user && res.user.name) return res.user.name;
  if (res.userName) return res.userName;
  if (res.email) return res.email;
  return "Neighbor";
}

export default function MyMealsPage() {
  const [meals, setMeals] = useState([]);
  const [mealsLoading, setMealsLoading] = useState(true);
  const [mealsError, setMealsError] = useState("");

  const [reservationsByMeal, setReservationsByMeal] = useState({});
  const [reservationsLoading, setReservationsLoading] = useState({});
  const [reservationsError, setReservationsError] = useState({});

  const [statusMessage, setStatusMessage] = useState("");
  const [updatingReservationId, setUpdatingReservationId] = useState(null);

  const hasToken = !!getAuthToken();
  const user = getStoredUser();

  // Load meals for the logged-in cook
  useEffect(() => {
    if (!hasToken) {
      setMealsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadMyMeals() {
      setMealsLoading(true);
      try {
        const data = await getMyMeals();
        if (!cancelled) {
          setMeals(Array.isArray(data) ? data : []);
          setMealsError("");
        }
      } catch (err) {
        if (!cancelled) {
          setMealsError(err?.message || "Could not load your meals.");
        }
      } finally {
        if (!cancelled) {
          setMealsLoading(false);
        }
      }
    }

    loadMyMeals();

    return () => {
      cancelled = true;
    };
  }, [hasToken]);

  async function loadReservationsForMeal(mealId) {
    if (!mealId) return;

    setReservationsError((prev) => ({ ...prev, [mealId]: "" }));
    setReservationsLoading((prev) => ({ ...prev, [mealId]: true }));

    try {
      const data = await getMealReservations(mealId);
      setReservationsByMeal((prev) => ({
        ...prev,
        [mealId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      setReservationsError((prev) => ({
        ...prev,
        [mealId]: err?.message || "Could not load reservations for this meal.",
      }));
    } finally {
      setReservationsLoading((prev) => ({ ...prev, [mealId]: false }));
    }
  }

  async function handleReservationStatusChange(mealId, reservation, newStatus) {
    setStatusMessage("");
    if (!reservation) return;

    const id = reservation.id ?? reservation._id;
    if (!id) {
      setStatusMessage("Missing reservation id; cannot update.");
      return;
    }

    try {
      setUpdatingReservationId(id);
      await updateReservationStatus(id, newStatus);
      setStatusMessage(`Reservation updated to "${newStatus}".`);
      // Refresh that meal's reservations
      await loadReservationsForMeal(mealId);
    } catch (err) {
      setStatusMessage(err?.message || "Could not update reservation.");
    } finally {
      setUpdatingReservationId(null);
    }
  }

  // --- Render guards ---

  if (!hasToken) {
    return (
      <main className="page page-my-meals">
        <h1>My Meals</h1>
        <p>You need to sign in as a cook to see your meals.</p>
        <p>
          Go back to the <Link to="/">main page</Link> and log in first.
        </p>
      </main>
    );
  }

  if (user && user.role && user.role !== "cook") {
    return (
      <main className="page page-my-meals">
        <h1>My Meals</h1>
        <p>
          You’re signed in as a <strong>{user.role}</strong>. Only cooks who
          create meals can see this page.
        </p>
        <p>
          You can still browse and reserve meals on the{" "}
          <Link to="/">main page</Link>.
        </p>
      </main>
    );
  }

  if (mealsLoading) {
    return (
      <main className="page page-my-meals">
        <h1>My Meals</h1>
        <p>Loading your meals…</p>
      </main>
    );
  }

  if (mealsError) {
    return (
      <main className="page page-my-meals">
        <h1>My Meals</h1>
        <p className="error">{mealsError}</p>
      </main>
    );
  }

  if (!meals.length) {
    return (
      <main className="page page-my-meals">
        <h1>My Meals</h1>
        <p>You haven’t created any meals yet.</p>
        <p>
          Use the “Create meal” form on the <Link to="/">main page</Link> to
          post your first meal.
        </p>
      </main>
    );
  }

  return (
    <main className="page page-my-meals">
      <h1>My Meals</h1>
      <p>These are the meals you’ve created as a cook.</p>

      {statusMessage && <p className="status">{statusMessage}</p>}

      <ul className="meal-list">
        {meals.map((meal) => {
          const id = meal.id ?? meal._id;
          const readyAt = meal.readyAt;
          const costPerServing = meal.costPerServing;
          const servingsTotal = meal.servingsTotal ?? meal.totalServings;
          const servingsAvailable =
            meal.servingsAvailable ?? meal.availableServings;

          const reservations = reservationsByMeal[id] || [];
          const isLoadingReservations = reservationsLoading[id];
          const reservationsErr = reservationsError[id];

          return (
            <li key={id || meal.title}>
              <div className="meal-item">
                <h2>{meal.title || "Untitled meal"}</h2>
                {meal.description && <p>{meal.description}</p>}

                <p>
                  <strong>Ready at:</strong>{" "}
                  {readyAt ? formatDateTime(readyAt) : "Not specified"}
                </p>
                <p>
                  <strong>Cost per serving:</strong>{" "}
                  {formatMoney(costPerServing)}
                </p>
                <p>
                  <strong>Servings:</strong>{" "}
                  {servingsAvailable != null && servingsTotal != null
                    ? `${servingsAvailable} available / ${servingsTotal} total`
                    : servingsTotal != null
                    ? `${servingsTotal} total`
                    : "n/a"}
                </p>

                <div className="meal-actions">
                  <button
                    type="button"
                    onClick={() => loadReservationsForMeal(id)}
                    disabled={isLoadingReservations}
                  >
                    {isLoadingReservations
                      ? "Loading reservations…"
                      : "View reservations"}
                  </button>
                </div>

                {reservationsErr && (
                  <p className="error">{reservationsErr}</p>
                )}

                {reservations.length > 0 && (
                  <div className="meal-reservations">
                    <h3>Reservations</h3>
                    <ul className="reservation-list">
                      {reservations.map((r) => {
                        const rid = r.id ?? r._id;
                        const status = r.status || "pending";
                        const servings = guessServings(r);
                        const createdAt = r.createdAt;

                        const canConfirm =
                          status === "pending" || status === "cancelled";
                        const canComplete = status === "confirmed";
                        const canCancel =
                          status !== "cancelled" && status !== "completed";

                        return (
                          <li key={rid || `${r.userId}-${createdAt}`}>
                            <div className="reservation-item">
                              <p>
                                <strong>Diner:</strong> {guessDinerName(r)}
                              </p>
                              <p>
                                <strong>Servings:</strong> {servings}
                              </p>
                              <p>
                                <strong>Status:</strong> {status}
                              </p>
                              {createdAt && (
                                <p>
                                  <strong>Requested on:</strong>{" "}
                                  {formatDateTime(createdAt)}
                                </p>
                              )}

                              <div className="reservation-actions">
                                {canConfirm && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleReservationStatusChange(
                                        id,
                                        r,
                                        "confirmed"
                                      )
                                    }
                                    disabled={updatingReservationId === rid}
                                  >
                                    {updatingReservationId === rid
                                      ? "Updating…"
                                      : "Confirm"}
                                  </button>
                                )}

                                {canComplete && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleReservationStatusChange(
                                        id,
                                        r,
                                        "completed"
                                      )
                                    }
                                    disabled={updatingReservationId === rid}
                                  >
                                    {updatingReservationId === rid
                                      ? "Updating…"
                                      : "Mark completed"}
                                  </button>
                                )}

                                {canCancel && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleReservationStatusChange(
                                        id,
                                        r,
                                        "cancelled"
                                      )
                                    }
                                    disabled={updatingReservationId === rid}
                                  >
                                    {updatingReservationId === rid
                                      ? "Updating…"
                                      : "Cancel"}
                                  </button>
                                )}
                              </div>

                              <details>
                                <summary>Debug details</summary>
                                <pre>{JSON.stringify(r, null, 2)}</pre>
                              </details>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

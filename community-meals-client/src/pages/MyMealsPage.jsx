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

export default function MyMealsPage() {
  const [user] = useState(() => getStoredUser());
  const [meals, setMeals] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [mealsError, setMealsError] = useState("");

  const [reservationsByMeal, setReservationsByMeal] = useState({});
  const [activeMealId, setActiveMealId] = useState(null);

  const [statusMessage, setStatusMessage] = useState("");
  const [updatingReservationId, setUpdatingReservationId] = useState(null);

  const hasToken = !!getAuthToken();

  useEffect(() => {
    if (!hasToken) {
      setLoadingMeals(false);
      return;
    }

    let cancelled = false;

    async function loadMyMeals() {
      setLoadingMeals(true);
      setMealsError("");

      try {
        const data = await getMyMeals();
        if (!cancelled) {
          setMeals(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setMealsError(err?.message || "Could not load your meals.");
        }
      } finally {
        if (!cancelled) {
          setLoadingMeals(false);
        }
      }
    }

    loadMyMeals();

    return () => {
      cancelled = true;
    };
  }, [hasToken]);

  async function toggleReservations(mealId) {
    if (!mealId) return;

    setActiveMealId((prev) => (prev === mealId ? null : mealId));

    // If we already have reservations loaded for this meal, don't refetch immediately
    if (reservationsByMeal[mealId]?.items) return;

    setReservationsByMeal((prev) => ({
      ...prev,
      [mealId]: { loading: true, error: "", items: [] },
    }));

    try {
      const items = await getMealReservations(mealId);
      setReservationsByMeal((prev) => ({
        ...prev,
        [mealId]: { loading: false, error: "", items: items || [] },
      }));
    } catch (err) {
      setReservationsByMeal((prev) => ({
        ...prev,
        [mealId]: {
          loading: false,
          error: err?.message || "Could not load reservations.",
          items: [],
        },
      }));
    }
  }

  async function handleUpdateReservationStatus(mealId, reservation, nextStatus) {
    setStatusMessage("");
    if (!mealId || !reservation) return;

    const reservationId = reservation.id ?? reservation._id;
    if (!reservationId) {
      setStatusMessage("Missing reservation id; cannot update.");
      return;
    }

    try {
      setUpdatingReservationId(reservationId);
      await updateReservationStatus(reservationId, nextStatus);
      setStatusMessage(`Reservation updated to ${nextStatus}.`);

      // Reload reservations for this meal
      const items = await getMealReservations(mealId);
      setReservationsByMeal((prev) => ({
        ...prev,
        [mealId]: { loading: false, error: "", items: items || [] },
      }));

      // Reload meals so servings counts stay correct
      const data = await getMyMeals();
      setMeals(Array.isArray(data) ? data : []);
    } catch (err) {
      setStatusMessage(err?.message || "Could not update reservation.");
    } finally {
      setUpdatingReservationId(null);
    }
  }

  if (!hasToken) {
    return (
      <main className="page page-my-meals">
        <h1>My Meals</h1>
        <p>You need to sign in to see your meals.</p>
        <p>
          Go back to the <Link to="/">Meals page</Link> and sign in first.
        </p>
      </main>
    );
  }

  return (
    <main className="page page-my-meals">
      <section className="card my-meals-header-card">
        <h1>My Meals</h1>
        {user ? (
          <p>
            Signed in as <strong>{user.name || user.email}</strong>{" "}
            {user.role && (
              <>
                (<code>{user.role}</code>)
              </>
            )}
          </p>
        ) : (
          <p>Signed-in cook dashboard.</p>
        )}
        <p className="hint">
          These are the meals you&apos;ve posted. You can see who reserved what
          for each meal and update reservation status.
        </p>
        <p>
          Need to post a new meal? Use the form on the{" "}
          <Link to="/">Meals</Link> page.
        </p>
        {statusMessage && <p className="status">{statusMessage}</p>}
      </section>

      <section className="card my-meals-list-card">
        {loadingMeals && <p>Loading your meals…</p>}
        {mealsError && <p className="error">{mealsError}</p>}

        {!loadingMeals && !mealsError && meals.length === 0 && (
          <p>You haven&apos;t posted any meals yet.</p>
        )}

        <ul className="my-meals-list">
          {meals.map((meal) => {
            const mealId = meal.id ?? meal._id ?? meal.mealId;
            const readyAt = formatDateTime(meal.readyAt);
            const total =
              meal.servingsTotal ??
              meal.totalServings ??
              meal.total_servings ??
              null;
            const available =
              meal.servingsAvailable ??
              meal.servings_remaining ??
              null;

            const reservationsState = reservationsByMeal[mealId] || {
              loading: false,
              error: "",
              items: [],
            };

            const isOpen = activeMealId === mealId;

            return (
              <li key={mealId}>
                <article className="meal-card my-meal-card">
                  <header>
                    <h2>{meal.title}</h2>
                    <p className="meal-meta">
                      {total != null && (
                        <span>
                          {total} total serving{total === 1 ? "" : "s"}
                        </span>
                      )}
                      {total != null && available != null && <span> · </span>}
                      {available != null && (
                        <span>{available} left</span>
                      )}
                      <span> · </span>
                      <span>{formatCurrency(meal.costPerServing)}</span>
                    </p>
                  </header>

                  {meal.description && (
                    <p className="meal-description">{meal.description}</p>
                  )}

                  <p className="meal-details">
                    {meal.location && <span>{meal.location}</span>}
                    {readyAt && (
                      <>
                        {meal.location && <span> · </span>}
                        <span>Ready at: {readyAt}</span>
                      </>
                    )}
                  </p>

                  <div className="meal-actions">
                    <button
                      type="button"
                      onClick={() => toggleReservations(mealId)}
                    >
                      {isOpen ? "Hide reservations" : "Show reservations"}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="meal-reservations">
                      {reservationsState.loading && (
                        <p>Loading reservations…</p>
                      )}
                      {reservationsState.error && (
                        <p className="error">
                          {reservationsState.error}
                        </p>
                      )}
                      {!reservationsState.loading &&
                        !reservationsState.error &&
                        reservationsState.items.length === 0 && (
                          <p>No reservations yet for this meal.</p>
                        )}

                      {reservationsState.items.length > 0 && (
                        <table className="reservations-table">
                          <thead>
                            <tr>
                              <th>Diner</th>
                              <th>Servings</th>
                              <th>Status</th>
                              <th>Reserved on</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reservationsState.items.map((r) => {
                              const servings =
                                r.servings ??
                                r.quantity ??
                                r.count ??
                                1;
                              const createdAt = formatDateTime(
                                r.createdAt || r.reservedAt
                              );

                              const dinerName =
                                r.diner?.name ||
                                r.user?.name ||
                                r.dinerName ||
                                r.userName ||
                                r.diner?.email ||
                                r.user?.email ||
                                "Unknown diner";

                              const status = r.status || "pending";
                              const reservationId = r.id ?? r._id;
                              const isUpdating =
                                updatingReservationId === reservationId;

                              return (
                                <tr
                                  key={
                                    reservationId ||
                                    `${mealId}-${createdAt}`
                                  }
                                >
                                  <td>{dinerName}</td>
                                  <td>{servings}</td>
                                  <td>{status}</td>
                                  <td>{createdAt}</td>
                                  <td>
                                    <div className="reservation-actions">
                                      {["confirmed", "picked_up", "cancelled"].map(
                                        (next) => (
                                          <button
                                            key={next}
                                            type="button"
                                            disabled={
                                              isUpdating || status === next
                                            }
                                            onClick={() =>
                                              handleUpdateReservationStatus(
                                                mealId,
                                                r,
                                                next
                                              )
                                            }
                                          >
                                            {next.replace("_", " ")}
                                          </button>
                                        )
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}

                      {reservationsState.items.length > 0 && (
                        <details>
                          <summary>Debug: raw reservations JSON</summary>
                          <pre>
                            {JSON.stringify(
                              reservationsState.items,
                              null,
                              2
                            )}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

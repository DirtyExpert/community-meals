// community-meals-client/src/pages/MyReservationsPage.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAuthToken,
  getMyReservations,
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

function guessMealTitle(reservation) {
  if (reservation.meal && reservation.meal.title) return reservation.meal.title;
  if (reservation.mealTitle) return reservation.mealTitle;
  if (reservation.meal && reservation.meal.id)
    return `Meal ${reservation.meal.id}`;
  if (reservation.mealId) return `Meal ${reservation.mealId}`;
  return "Meal";
}

function guessServings(reservation) {
  return (
    reservation.servings ??
    reservation.quantity ??
    reservation.count ??
    1
  );
}

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const hasToken = !!getAuthToken();

  useEffect(() => {
    if (!hasToken) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadReservations() {
      setLoading(true);
      try {
        const data = await getMyReservations();
        if (!cancelled) {
          setReservations(data);
          setLoadError("");
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err?.message || "Could not load reservations.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReservations();

    return () => {
      cancelled = true;
    };
  }, [hasToken]);

  async function handleCancel(reservation) {
    setStatusMessage("");
    if (!reservation) return;

    const id = reservation.id ?? reservation._id;
    if (!id) {
      setStatusMessage("Missing reservation id; cannot cancel.");
      return;
    }

    try {
      setUpdatingId(id);
      await updateReservationStatus(id, "cancelled");
      setStatusMessage("Reservation cancelled.");

      const data = await getMyReservations();
      setReservations(data || []);
    } catch (err) {
      setStatusMessage(err?.message || "Could not cancel reservation.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (!hasToken) {
    return (
      <main className="page page-reservations">
        <h1>My Reservations</h1>
        <p>You need to sign in to see your reservations.</p>
        <p>
          Go back to the <Link to="/">main page</Link> and log in first.
        </p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page page-reservations">
        <h1>My Reservations</h1>
        <p>Loading your reservations…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="page page-reservations">
        <h1>My Reservations</h1>
        <p className="error">{loadError}</p>
      </main>
    );
  }

  if (!reservations.length) {
    return (
      <main className="page page-reservations">
        <h1>My Reservations</h1>
        <p>You don’t have any reservations yet.</p>
        <p>
          Browse meals on the <Link to="/">main page</Link> and reserve a
          serving to see them here.
        </p>
      </main>
    );
  }

  return (
    <main className="page page-reservations">
      <h1>My Reservations</h1>
      <p>These are the meals you’ve reserved so far.</p>

      {statusMessage && <p className="status">{statusMessage}</p>}

      <ul className="reservation-list">
        {reservations.map((r) => {
          const title = guessMealTitle(r);
          const servings = guessServings(r);
          const status = r.status || "pending";
          const readyAt =
            r.meal?.readyAt || r.readyAt || r.mealReadyAt || null;
          const createdAt = r.createdAt || null;
          const id = r.id ?? r._id;

          const canCancel =
            status !== "cancelled" &&
            status !== "completed" &&
            status !== "picked_up";

          return (
            <li key={id || `${r.mealId}-${r.createdAt || Math.random()}`}>
              <div className="reservation-item">
                <h2>{title}</h2>
                <p>
                  <strong>Servings:</strong> {servings}
                </p>
                <p>
                  <strong>Status:</strong> {status}
                </p>
                {readyAt && (
                  <p>
                    <strong>Ready at:</strong> {formatDateTime(readyAt)}
                  </p>
                )}
                {createdAt && (
                  <p>
                    <strong>Reserved on:</strong>{" "}
                    {formatDateTime(createdAt)}
                  </p>
                )}

                {canCancel && (
                  <div className="reservation-actions">
                    <button
                      type="button"
                      onClick={() => handleCancel(r)}
                      disabled={updatingId === id}
                    >
                      {updatingId === id
                        ? "Cancelling..."
                        : "Cancel reservation"}
                    </button>
                  </div>
                )}

                <details>
                  <summary>Debug details</summary>
                  <pre>{JSON.stringify(r, null, 2)}</pre>
                </details>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

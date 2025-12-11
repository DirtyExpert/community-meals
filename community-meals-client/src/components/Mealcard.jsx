// Card for displaying a single meal.
// Tries to be resilient to different backend field names.

function formatDateTime(meal) {
  // Prefer the backend's readyAt field
  if (meal.readyAt) {
    const d = new Date(meal.readyAt);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString();
    }
  }

  // Fallback: ISO combined date/time
  if (meal.dateTime) {
    const d = new Date(meal.dateTime);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString();
    }
  }

  // Separate date / time fields
  if (meal.date || meal.time) {
    const datePart = meal.date ? new Date(meal.date) : null;

    if (datePart && !Number.isNaN(datePart.getTime())) {
      if (meal.time) {
        return `${datePart.toLocaleDateString()} • ${meal.time}`;
      }
      return datePart.toLocaleDateString();
    }

    // Fall back to raw strings if parsing fails
    if (meal.date && meal.time) {
      return `${meal.date} • ${meal.time}`;
    }
    return meal.date || meal.time;
  }

  return null;
}

export default function MealCard({ meal }) {
  const title =
    meal.title ||
    meal.name ||
    meal.mealName ||
    'Community meal';

  const cookName =
    meal.cookName ||
    meal.cook ||
    meal.hostName ||
    meal.host ||
    null;

  const location =
    meal.location ||
    meal.address ||
    meal.city ||
    null;

  const totalServings =
    meal.servingsTotal ??
    meal.totalServings ??
    null;

  const availableServings =
    meal.servingsAvailable ??
    meal.availableServings ??
    null;

  const priceRaw =
    meal.costPerServing ??
    meal.pricePerServing ??
    null;

  const when = formatDateTime(meal);

  let priceLabel = null;
  if (priceRaw != null) {
    const num = Number(priceRaw);
    if (Number.isFinite(num)) {
      priceLabel = `$${num.toFixed(2)} per serving`;
    } else {
      priceLabel = `${priceRaw} per serving`;
    }
  }

  return (
    <article className="meal-card">
      <h2 className="meal-title">{title}</h2>

      {cookName && (
        <p className="meal-meta">
          <strong>Cook:</strong> {cookName}
        </p>
      )}

      {location && (
        <p className="meal-meta">
          <strong>Location:</strong> {location}
        </p>
      )}

      {when && (
        <p className="meal-meta">
          <strong>Ready at:</strong> {when}
        </p>
      )}

      {(totalServings != null || availableServings != null) && (
        <p className="meal-meta">
          <strong>Servings:</strong>{' '}
          {totalServings != null ? totalServings : '—'}
          {availableServings != null && (
            <> &nbsp;(<span>{availableServings} available</span>)</>
          )}
        </p>
      )}

      {priceLabel && (
        <p className="meal-meta">
          <strong>Price:</strong> {priceLabel}
        </p>
      )}

      {meal.description && (
        <p className="meal-description">{meal.description}</p>
      )}

      <div className="meal-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            // Placeholder for now – we’ll wire this to POST /meals/:id/reservations later.
            alert('Reservation flow not built yet. This is just a preview UI.');
          }}
        >
          Reserve a spot
        </button>
      </div>

      {/* Debug panel helps verify the backend shape while we’re wiring things up */}
      <details className="meal-raw">
        <summary>Debug details</summary>
        <pre>{JSON.stringify(meal, null, 2)}</pre>
      </details>
    </article>
  );
}

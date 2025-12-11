// community-meals-client/src/pages/CookProfilePage.jsx

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMeals } from "../api/client.js";

// Helpers to read/write local cook profile data
function loadLocalProfile(cookKey) {
  if (!cookKey || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`cm_cook_profile_${cookKey}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse cook profile from localStorage", err);
    return null;
  }
}

function saveLocalProfile(cookKey, profile) {
  if (!cookKey || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `cm_cook_profile_${cookKey}`,
      JSON.stringify(profile)
    );
  } catch (err) {
    console.error("Failed to save cook profile to localStorage", err);
  }
}

function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("cm_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function CookProfilePage() {
  const params = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
    specialties: "",
  });
  const [statusMessage, setStatusMessage] = useState("");

  // Load logged-in user (if any) from localStorage
  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  // Decide which cook we’re showing:
  // - If URL has /cooks/:cookId, use that
  // - Otherwise, if logged in, use currentUser.id
  const cookKey = useMemo(() => {
    if (params.cookId) return params.cookId;
    if (currentUser && (currentUser.id || currentUser._id)) {
      return String(currentUser.id || currentUser._id);
    }
    return null;
  }, [params.cookId, currentUser]);

  const viewingSelf = useMemo(() => {
    if (!cookKey || !currentUser) return false;
    const userId = String(currentUser.id || currentUser._id || "");
    return cookKey === userId;
  }, [cookKey, currentUser]);

  // Load profile from localStorage (per cookKey)
  useEffect(() => {
    if (!cookKey) return;
    const stored = loadLocalProfile(cookKey);
    if (stored) {
      setProfile((prev) => ({
        ...prev,
        ...stored,
      }));
    }
  }, [cookKey]);

  // Load this cook's meals
  useEffect(() => {
    async function loadMealsForCook() {
      if (!cookKey) {
        setMeals([]);
        setLoadingMeals(false);
        return;
      }

      setLoadingMeals(true);
      setLoadError("");

      try {
        const allMeals = (await getMeals()) || [];

        const filtered = allMeals.filter((meal) => {
          if (!meal) return false;

          // Preferred: match by cookId
          if (meal.cookId && String(meal.cookId) === String(cookKey)) {
            return true;
          }

          // Fallback if cookId isn't present and we're viewing self:
          if (
            !params.cookId &&
            currentUser &&
            meal.cookName &&
            currentUser.name
          ) {
            return meal.cookName === currentUser.name;
          }

          return false;
        });

        setMeals(filtered);
      } catch (err) {
        console.error("Error loading meals for cook", err);
        setLoadError(err?.message || "Could not load meals for this cook.");
      } finally {
        setLoadingMeals(false);
      }
    }

    loadMealsForCook();
  }, [cookKey, currentUser, params.cookId]);

  const primaryMeal = meals[0] || null;

  const displayName =
    profile.displayName ||
    (primaryMeal && primaryMeal.cookName) ||
    (currentUser && currentUser.name) ||
    "Local cook";

  const avatarUrl =
    profile.avatarUrl ||
    (primaryMeal && primaryMeal.cookAvatarUrl) ||
    "";

  const locationText =
    (primaryMeal && primaryMeal.location) ||
    (currentUser && currentUser.zip && `Hanford · ${currentUser.zip}`) ||
    "Hanford · 93230";

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSaveProfile(event) {
    event.preventDefault();
    if (!cookKey) return;
    saveLocalProfile(cookKey, profile);
    setStatusMessage("Profile saved on this device.");
    setTimeout(() => setStatusMessage(""), 3000);
  }

  return (
    <main className="page page-cook-profile">
      <header className="page-header">
        <h1>Cook Profile</h1>
        <p>
          <Link to="/">← Back to meals</Link>
        </p>
      </header>

      {!cookKey && (
        <section className="card">
          <p>
            We couldn&apos;t determine which cook to show. Try visiting this page
            from a meal card or sign in as a cook first.
          </p>
        </section>
      )}

      {cookKey && (
        <>
          {/* Public cook info */}
          <section className="card cook-profile-header">
            <div className="cook-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} />
              ) : (
                <div className="cook-avatar-placeholder">
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>

            <div className="cook-profile-main">
              <h2>{displayName}</h2>
              <p className="cook-location">{locationText}</p>

              {profile.specialties && (
                <p className="cook-specialties">
                  <strong>Specialties:</strong> {profile.specialties}
                </p>
              )}

              {(profile.bio || !viewingSelf) && (
                <p className="cook-bio">
                  {profile.bio ||
                    "This cook hasn’t written a bio yet, but their food speaks for itself."}
                </p>
              )}

              {viewingSelf && (
                <p className="cook-self-hint">
                  You&apos;re viewing your public cook page as neighbors would see
                  it.
                </p>
              )}
            </div>
          </section>

          {/* Edit panel (only for the cook themselves) */}
          {viewingSelf && (
            <section className="card cook-profile-edit">
              <h3>Edit your profile</h3>
              <p>
                This info is stored locally in your browser for now. Later we can
                sync it to the backend so it travels with your account.
              </p>

              <form onSubmit={handleSaveProfile} className="cook-profile-form">
                <label>
                  Display name
                  <input
                    type="text"
                    name="displayName"
                    value={profile.displayName}
                    onChange={handleProfileChange}
                    placeholder="How neighbors should see your name"
                  />
                </label>

                <label>
                  Photo URL
                  <input
                    type="url"
                    name="avatarUrl"
                    value={profile.avatarUrl}
                    onChange={handleProfileChange}
                    placeholder="Link to a square photo of you or your kitchen"
                  />
                </label>

                <label>
                  Specialties
                  <input
                    type="text"
                    name="specialties"
                    value={profile.specialties}
                    onChange={handleProfileChange}
                    placeholder="e.g. Mexican, BBQ, vegan soups"
                  />
                </label>

                <label>
                  Short bio
                  <textarea
                    name="bio"
                    rows={3}
                    value={profile.bio}
                    onChange={handleProfileChange}
                    placeholder="Tell neighbors a bit about you and your cooking style."
                  />
                </label>

                <button type="submit" className="button">
                  Save profile
                </button>

                {statusMessage && (
                  <p className="status-message success">{statusMessage}</p>
                )}
              </form>
            </section>
          )}

          {/* Meals from this cook */}
          <section className="card cook-meals-list">
            <h3>Meals from {displayName}</h3>

            {loadingMeals && <p>Loading meals…</p>}
            {loadError && <p className="error">{loadError}</p>}

            {!loadingMeals && !loadError && meals.length === 0 && (
              <p>This cook doesn&apos;t have any meals listed right now.</p>
            )}

            {!loadingMeals && !loadError && meals.length > 0 && (
              <ul className="meal-list">
                {meals.map((meal) => (
                  <li key={meal.id || meal._id} className="meal-card">
                    <h4>{meal.title || "Meal"}</h4>
                    {meal.description && <p>{meal.description}</p>}
                    <p className="meta">
                      {meal.readyAt && (
                        <>
                          Ready at{" "}
                          {new Date(meal.readyAt).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </>
                      )}
                      {meal.location && (
                        <>
                          {" "}
                          · <span>{meal.location}</span>
                        </>
                      )}
                    </p>
                    <p className="meta">
                      Servings available:{" "}
                      {meal.servingsAvailable ?? meal.servingsTotal ?? "?"}
                    </p>
                    {typeof meal.costPerServing === "number" && (
                      <p className="meta">
                        Cost per serving: ${meal.costPerServing.toFixed(2)}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}

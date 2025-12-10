// src/App.jsx
import React, { useEffect, useState } from "react";
import { login } from "./api/auth";
import { fetchMeals, reserveMeal } from "./api/meals";

function App() {
  const [email, setEmail] = useState("diner@example.com");
  const [password, setPassword] = useState("password123");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [meals, setMeals] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [message, setMessage] = useState("");

  // Load meals on startup
  useEffect(() => {
    loadMeals();
  }, []);

  async function loadMeals() {
    try {
      setLoadingMeals(true);
      const data = await fetchMeals();
      setMeals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMessage(`Error loading meals: ${err.message}`);
    } finally {
      setLoadingMeals(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await login(email, password);
      setUser(res.user);
      setToken(res.token);
      setMessage(`Logged in as ${res.user.name} (${res.user.role})`);
    } catch (err) {
      console.error(err);
      setMessage(`Login failed: ${err.message}`);
    }
  }

  async function handleReserve(mealId) {
    if (!token) {
      setMessage("You need to log in as a diner to reserve a meal.");
      return;
    }

    setMessage("");
    try {
      const res = await reserveMeal(mealId, 1, token);
      setMessage(`Reserved 1 serving on meal ${mealId} (reservation ${res.id}).`);
      await loadMeals(); // refresh available servings
    } catch (err) {
      console.error(err);
      setMessage(`Reservation failed: ${err.message}`);
    }
  }

  return (
    <div style={styles.container}>
      <h1>Community Meals (93230)</h1>

      <section style={styles.section}>
        <h2>Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="diner@example.com or cook@example.com"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
            />
          </div>
          <button type="submit" style={styles.button}>
            Log In
          </button>
        </form>
        {user && (
          <p style={styles.smallText}>
            Logged in as <strong>{user.name}</strong> ({user.role}) in zip{" "}
            <strong>{user.zip}</strong>
          </p>
        )}
      </section>

      <section style={styles.section}>
        <h2>Available Meals</h2>
        {loadingMeals && <p>Loading meals...</p>}
        {!loadingMeals && meals.length === 0 && <p>No meals available yet.</p>}
        <div style={styles.mealList}>
          {meals.map((meal) => (
            <div key={meal.id} style={styles.mealCard}>
              <h3>{meal.title}</h3>
              <p>{meal.description}</p>
              <p style={styles.smallText}>
                Cost per serving: <strong>${meal.costPerServing}</strong>
              </p>
              <p style={styles.smallText}>
                Servings available: <strong>{meal.servingsAvailable}</strong> /{" "}
                {meal.servingsTotal}
              </p>
              <button
                style={styles.buttonSecondary}
                onClick={() => handleReserve(meal.id)}
              >
                Reserve 1 serving
              </button>
            </div>
          ))}
        </div>
      </section>

      {message && (
        <div style={styles.messageBox}>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "1.5rem",
  },
  section: {
    marginBottom: "2rem",
    padding: "1rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    maxWidth: "400px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: 600,
  },
  input: {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "0.95rem",
  },
  button: {
    padding: "0.6rem 1rem",
    borderRadius: "4px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  buttonSecondary: {
    padding: "0.5rem 0.9rem",
    borderRadius: "4px",
    border: "1px solid #2563eb",
    background: "#fff",
    color: "#2563eb",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  smallText: {
    fontSize: "0.85rem",
    color: "#555",
  },
  mealList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  mealCard: {
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #eee",
    background: "#fafafa",
  },
  messageBox: {
    marginTop: "1rem",
    padding: "0.75rem",
    borderRadius: "6px",
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
  },
};

export default App;

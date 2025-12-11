// community-meals-client/src/App.jsx

import { Routes, Route, Link } from "react-router-dom";
import MealsListPage from "./pages/MealsListPage";
import MyReservationsPage from "./pages/MyReservationsPage";
import MyMealsPage from "./pages/MyMealsPage";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">
            <span className="brand-mark">CM</span>
            <div>
              <div className="brand-title">Community Meals</div>
              <div className="brand-subtitle">Hanford · 93230</div>
            </div>
          </div>

          <nav className="nav">
            <Link to="/">Meals</Link>
            <Link to="/reservations">My Reservations</Link>
            <Link to="/my-meals">My Meals</Link>
            {/* Future:
              <Link to="/login">Sign in</Link>
            */}
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<MealsListPage />} />
          <Route path="/reservations" element={<MyReservationsPage />} />
          <Route path="/my-meals" element={<MyMealsPage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <small>
          Backend: <code>http://localhost:4000</code> · Local pilot only.
        </small>
      </footer>
    </div>
  );
}

export default App;

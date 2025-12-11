import { Routes, Route, Link } from "react-router-dom";
import MealsListPage from "./pages/MealsListPage.jsx";
import MyReservationsPage from "./pages/MyReservationsPage.jsx";
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
            <Link to="/my-reservations">My reservations</Link>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<MealsListPage />} />
          <Route path="/my-reservations" element={<MyReservationsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

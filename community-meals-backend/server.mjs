// server.mjs
// Entry point for the Community Meals backend (93230 pilot)

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env if present (optional, but nice)
dotenv.config();

import healthRouter from "./src/routes/health.mjs";
import authRouter from "./src/routes/auth.mjs";
import mealsRouter from "./src/routes/meals.mjs";
import reservationsRouter from "./src/routes/reservations.mjs";

const app = express();

// ----- Basic middleware -----

// Allow JSON bodies
app.use(express.json());

// Allow CORS so the React Native app / local dev can hit this API
app.use(
  cors({
    origin: "*", // For MVP; later we can restrict this
  })
);

// Simple request logger (MVP-level)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// ----- Routes -----

// Health check
app.use("/health", healthRouter);

// Auth routes
app.use("/auth", authRouter);

// Meals routes
app.use("/meals", mealsRouter);

// Reservations routes
app.use("/reservations", reservationsRouter);

// ----- 404 handler -----

app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    path: req.url,
  });
});

// ----- Error handler -----

// Basic centralized error handler for now
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: message,
  });
});

// ----- Server startup -----

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Community Meals backend running on port ${PORT}`);
});

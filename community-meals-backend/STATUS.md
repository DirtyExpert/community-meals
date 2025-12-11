# STATUS – Community Meals Backend

Last updated: 2025-12-10

## Quick summary for GPT / future me

- Repo root: `community-meals`
- Backend: `community-meals-backend` (Express, ES modules, in-memory DB)
- Frontend: `community-meals-client` (Vite + React web client)
- API docs: `docs/BACKEND-API.md`
- GitHub: https://github.com/DirtyExpert/community-meals

This is a pilot app for 93230 (Hanford) where local cooks can list home-cooked meals and diners can reserve servings.

---

## Backend status (MVP COMPLETE)

### Tech

- Node + Express (`server.mjs`)
- ES modules (`"type": "module"` in `package.json`)
- In-memory database under `src/db/` (no persistence yet)
- JWT auth with simple middleware

### Main files

- `server.mjs` – app setup, middleware, route registration, error handling.
- `src/routes/health.mjs` – `GET /health`
- `src/routes/auth.mjs` – `POST /auth/register`, `POST /auth/login`
- `src/routes/meals.mjs` – meals CRUD-ish routes + meal-level reservations routes
- `src/routes/reservations.mjs` – generic reservations routes
- `src/middleware/authMiddleware.mjs` – extracts user from JWT
- `src/db/index.mjs` – in-memory data store + `generateId`
- `src/db/models/*.mjs` – User, Meal, Reservation helpers
- `src/services/*.mjs` – business logic for auth, meals, reservations
- `docs/BACKEND-API.md` – detailed endpoint documentation

### API summary

- **Health**
  - `GET /health` – uptime/status JSON

- **Auth**
  - `POST /auth/register` – `{ name, email, password, role("cook"|"diner"), zip("93230") }`
  - `POST /auth/login` – `{ email, password }` → `{ user, token }`

- **Meals**
  - `GET /meals` – public list of open meals (filters: `zip`, `from`, `freeOnly`)
  - `GET /meals/:id` – public meal details
  - `GET /meals/mine` – auth, meals created by current user
  - `POST /meals` – auth, create meal
  - `PATCH /meals/:id` – auth, only owner can update

  Notes:
  - `costPerServing >= 0`, **no upper limit**; price is market-driven.
  - `servingsAvailable` is tracked and used for reservations.

- **Reservations**
  - `POST /meals/:id/reservations` – auth, diner reserves servings
  - `GET /meals/:id/reservations` – auth, cook sees reservations for their meal
  - `GET /reservations/mine` – auth, list reservations for current user
  - `PATCH /reservations/:id` – auth, update status with permissions:
    - Diner: can only set `status: "cancelled"` on their own reservations.
    - Cook: can set `"confirmed" | "completed" | "cancelled"` on reservations for their meals.
  - When a `confirmed` reservation is cancelled, `servingsAvailable` is increased back.

### Data / limitations

- All data is **in-memory**. Restarting `npm run dev` wipes:
  - users
  - meals
  - reservations
- Zip is currently restricted to `"93230"` at registration time.
- Roles are lightweight and mostly enforced by route logic (not a full RBAC system).

---

## How to run (local dev)

From repo root:

```bash
# Backend
cd community-meals-backend
npm install        # first time only
npm run dev        # starts server on http://localhost:4000
# STATUS – Community Meals Backend

Last updated: 2025-12-10

## Quick summary for GPT / future me

- Repo root: `community-meals`
- Backend: `community-meals-backend` (Express, ES modules, in-memory DB)
- Frontend: `community-meals-client` (Vite + React web client)
- API docs: `docs/BACKEND-API.md`
- GitHub: https://github.com/DirtyExpert/community-meals

This is a pilot app for 93230 (Hanford) where local cooks can list home-cooked meals and diners can reserve servings.

---

## Backend status (MVP COMPLETE)

### Tech

- Node + Express (`server.mjs`)
- ES modules (`"type": "module"` in `package.json`)
- In-memory database under `src/db/` (no persistence yet)
- JWT auth with simple middleware

### Main files

- `server.mjs` – app setup, middleware, route registration, error handling.
- `src/routes/health.mjs` – `GET /health`
- `src/routes/auth.mjs` – `POST /auth/register`, `POST /auth/login`
- `src/routes/meals.mjs` – meals CRUD-ish routes + meal-level reservations routes
- `src/routes/reservations.mjs` – generic reservations routes
- `src/middleware/authMiddleware.mjs` – extracts user from JWT
- `src/db/index.mjs` – in-memory data store + `generateId`
- `src/db/models/*.mjs` – User, Meal, Reservation helpers
- `src/services/*.mjs` – business logic for auth, meals, reservations
- `docs/BACKEND-API.md` – detailed endpoint documentation

### API summary

- **Health**
  - `GET /health` – uptime/status JSON

- **Auth**
  - `POST /auth/register` – `{ name, email, password, role("cook"|"diner"), zip("93230") }`
  - `POST /auth/login` – `{ email, password }` → `{ user, token }`

- **Meals**
  - `GET /meals` – public list of open meals (filters: `zip`, `from`, `freeOnly`)
  - `GET /meals/:id` – public meal details
  - `GET /meals/mine` – auth, meals created by current user
  - `POST /meals` – auth, create meal
  - `PATCH /meals/:id` – auth, only owner can update

  Notes:
  - `costPerServing >= 0`, **no upper limit**; price is market-driven.
  - `servingsAvailable` is tracked and used for reservations.

- **Reservations**
  - `POST /meals/:id/reservations` – auth, diner reserves servings
  - `GET /meals/:id/reservations` – auth, cook sees reservations for their meal
  - `GET /reservations/mine` – auth, list reservations for current user
  - `PATCH /reservations/:id` – auth, update status with permissions:
    - Diner: can only set `status: "cancelled"` on their own reservations.
    - Cook: can set `"confirmed" | "completed" | "cancelled"` on reservations for their meals.
  - When a `confirmed` reservation is cancelled, `servingsAvailable` is increased back.

### Data / limitations

- All data is **in-memory**. Restarting `npm run dev` wipes:
  - users
  - meals
  - reservations
- Zip is currently restricted to `"93230"` at registration time.
- Roles are lightweight and mostly enforced by route logic (not a full RBAC system).

---

## How to run (local dev)

From repo root:

```bash
# Backend
cd community-meals-backend
npm install        # first time only
npm run dev        # starts server on http://localhost:4000
Health check:

GET http://localhost:4000/health

Example happy path:

POST /auth/register for a cook (cook@example.com)

POST /auth/register for a diner (diner@example.com)

Cook POST /meals to create something like "Big Pot of Chili"

Diner POST /meals/:id/reservations to reserve servings

See docs/BACKEND-API.md for full JSON examples.

Frontend (summary – see client project for details)
Location: ../community-meals-client

Vite + React web client that talks to this backend.

Uses:

POST /auth/login

GET /meals

POST /meals/:id/reservations

Basic flows in the current client:

Log in as diner (diner@example.com / password123)

See list of meals

Click “Reserve 1 serving” → calls backend and refreshes servings count

Next possible steps (not started yet)
Add persistent DB (SQLite/Postgres) instead of in-memory.

Add cook dashboard endpoints (e.g., GET /meals/mine + reservations grouped).

Add filtering & search (by time, tags, price).

Basic rate limiting and production-ready CORS/secret handling.

yaml
Copy code

Save that file.

---

## 2️⃣ (Optional but nice) Commit + push STATUS change

If you’ve got a tiny bit of gas left before the break, this keeps GitHub in sync:

```powershell
cd C:\community-meals
git status
git add community-meals-backend/STATUS.md
git commit -m "Update backend STATUS after MVP + client hookup"
git push
Then you’re free to shut everything down knowing:

Backend is documented

Frontend is talking to it

Repo is on GitHub

STATUS tells future-you exactly where you left off

Crash time approved. 🛋️






# Community Meals – Project STATUS

_Last updated: 2025-12-10_

---

## High-Level

A small web app to connect local home cooks with neighbors who want affordable, home-style meals.

- **Backend:** Node + Express (ES modules), in-memory storage, JWT auth.
- **Frontend:** Vite + React, React Router, minimal styling (vanilla CSS).

This document tracks what’s working right now and what’s next.

---

## Backend (community-meals-backend)

**Tech**

- Node.js + Express
- ES modules (`.mjs`)
- In-memory data store (no persistent DB yet)
- JWT-based authentication
- Port: `4000`

**Auth**

- `POST /auth/register`
  - Body (expected): `{ name, email, password, role, zip }`
  - Creates a user (e.g., role `"cook"` for meal creators, `"diner"` for eaters).
- `POST /auth/login`
  - Body: `{ email, password }`
  - Returns `{ user, token }` on success.
- JWT is required for protected routes via `Authorization: Bearer <token>` header.

**Meals**

- `GET /meals`
  - Returns list of meals (public).
- `GET /meals/:id`
  - Returns a single meal.
- `GET /meals/mine`
  - Returns meals for the authenticated cook.
- `POST /meals` _(auth required)_
  - Creates a meal for the logged-in cook.
  - **Required fields (current implementation):**
    - `title` (string)
    - `description` (string)
    - `servingsTotal` (number)
    - `costPerServing` (number)
    - `readyAt` (ISO timestamp)
  - Optional / extra fields used by frontend:
    - `cookName`
    - `location`
- `PATCH /meals/:id` _(auth required)_
  - Update an existing meal (owner-only).

**Reservations**

- `POST /meals/:id/reservations` _(auth likely required)_
  - Create a reservation for a meal.
- `GET /meals/:id/reservations`
  - List reservations for a given meal (probably cook-only).
- `GET /reservations/mine`
  - List reservations for the currently authenticated user.
- `PATCH /reservations/:id`
  - Update a reservation (e.g., cancel / change quantity).

> Frontend does **not** call the reservations endpoints yet.

---

## Frontend (community-meals-client)

**Tech**

- Vite + React
- React Router (`BrowserRouter`)
- Vanilla CSS in `src/App.css`
- API client in `src/api/client.js`

**Routing**

- `src/main.jsx`
  - Wraps `<App />` with `<BrowserRouter>`.
- `src/App.jsx`
  - Base layout: header, nav, main, footer.
  - Routes:
    - `/` → `MealsListPage`

**API Client (`src/api/client.js`)**

- `API_BASE_URL` from `VITE_API_BASE_URL` or defaults to `http://localhost:4000`.
- Auth token stored in `localStorage` under key `cm_token`.
- All requests automatically attach `Authorization: Bearer <token>` if present.

Exports:

- `getAuthToken()`, `setAuthToken(token)`, `clearAuthToken()`
- `getMeals()` → `GET /meals`
- `createMeal(meal)` → `POST /meals` (auth required)
- `registerUser({ name, email, password, role, zip })` → `POST /auth/register`
- `loginUser({ email, password })` → `POST /auth/login` (also sets token)

**Meals List Page (`src/pages/MealsListPage.jsx`)**

Single-page MVP at `/` that currently does all of this:

1. **Auth card**
   - If not signed in:
     - Shows a simple form: `name`, `email`, `password`.
     - On submit:
       - Tries `loginUser(email, password)`.
       - If login fails with auth-style errors, attempts `registerUser` as a cook in ZIP `93230`, then logs in.
     - Stores user object in `localStorage` under `cm_user`.
   - If signed in:
     - Shows “Signed in as X”.
     - Provides **Sign out** button (clears token + user).

2. **Create Meal card**
   - Form fields:
     - `Title`
     - `Cook / host name`
     - `Location`
     - `Date`
     - `Time`
     - `Servings (total)`
     - `Cost per serving ($)`
     - `Description`
   - On submit, if user is not signed in:
     - Shows error: must be signed in as a cook to create meals.
   - On submit, if signed in:
     - Builds payload that matches backend requirements:
       - `title`
       - `description`
       - `servingsTotal` (number, default 1)
       - `costPerServing` (number, default 0)
       - `readyAt` (ISO timestamp composed from

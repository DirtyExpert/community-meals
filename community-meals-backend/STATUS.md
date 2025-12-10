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







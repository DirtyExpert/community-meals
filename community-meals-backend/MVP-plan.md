1. Where this goes

In your community-meals repo:

File path:
docs/MVP-plan.md

Open that in VS Code and replace whatever’s in there with the markdown below.

2. Full docs/MVP-plan.md (backend-focused outline + timeline)
# Community Meals – MVP Plan (Backend-First)

App: Community Meals – 93230 Pilot  
Scope: Backend first, with a simple React Native client later.  
Goal: Let cooks in 93230 post home-cooked meals and let neighbors reserve portions.

---

## 1. High-Level Overview

### 1.1 Concept

This app lets local community members:

- **Cooks**
  - Post home-cooked meals (title, description, allergens, servings, time).
  - Offer them free or at very low cost (to cover ingredients).
  - Track reservations and mark meals as ready/picked up.

- **Diners / Neighbors**
  - Browse available meals in the 93230 zip.
  - Filter by date, price (free-only), and dietary tags.
  - Reserve servings and see status updates.

For now, the app is **limited to zip 93230** and focuses on learning, clear code, and small steps.

### 1.2 Dev Approach

- Built by a **beginner** with **heavy GPT assistance**.
- GPT should:
  - Always see the **full file** before rewriting it.
  - Understand **what the file is for** in the app.
  - Return either a **full new version** or a **very clear patch**, not vague “insert this somewhere” snippets.
- `docs/STATUS.md` will be kept up to date and pasted into GPT sessions as a quick “state of the project.”

---

## 2. Backend MVP Scope

### 2.1 Core Responsibilities

The backend will:

1. Provide a REST API for:
   - Authentication (register, login).
   - Managing meals (create, list, get details, update/close).
   - Managing reservations (create, list, update status).
2. Enforce:
   - Basic auth via JWT.
   - Limiting meals to zip 93230 (for MVP).
3. Provide:
   - A `/health` endpoint to check if the server is up.
   - Clear error responses (status codes + JSON error messages).

### 2.2 Non-Goals for MVP

- No payment processing yet.
- No real-time chat or complex notifications.
- No advanced admin dashboard (just DB/manual tools for now).
- No multi-zip support (only 93230).

---

## 3. Backend Tech Stack & Structure

### 3.1 Tech Choices

- Runtime: **Node.js**
- Framework: **Express**
- Database: For MVP, **one simple choice** (to be decided when coding starts, e.g.:
  - SQLite / Postgres / MongoDB — TBH anything is fine; pick one and commit.)
- Auth: **JWT** (JSON Web Token) in `Authorization: Bearer <token>` header.

### 3.2 Folder Structure

Root for backend:

```text
community-meals-backend/
  package.json
  server.mjs         # Entry point
  .env               # Environment variables (not committed)
  src/
    routes/
      auth.mjs
      meals.mjs
      reservations.mjs
      health.mjs
    controllers/
      authController.mjs
      mealsController.mjs
      reservationsController.mjs
    services/
      authService.mjs
      mealsService.mjs
      reservationsService.mjs
    db/
      index.mjs      # DB client/connection
      models/
        User.mjs
        Meal.mjs
        Reservation.mjs
    middleware/
      authMiddleware.mjs
      errorHandler.mjs
    utils/
      logger.mjs
      validators.mjs


Hints for future self:

Routes: Define URL paths, parse basic params, call controllers.

Controllers: Handle request/response, call services.

Services: Contain the business logic + DB interaction via models.

Models: Define tables/collections and basic CRUD helpers.

Middleware: JWT auth, centralized error handler.

Utils: Logging, basic validation helpers.

4. Data Models (MVP)

These are conceptual models first; exact syntax depends on DB chosen later.

4.1 User

Represents a person using the app.

Fields:

id – unique identifier

name – string

email – string (unique)

passwordHash – string

role – enum: "cook" | "diner" | "both"

zip – string (for MVP, must be "93230")

createdAt – datetime

updatedAt – datetime

4.2 Meal

A meal posted by a cook.

Fields:

id – unique identifier

userId – reference to User (the cook)

title – string

description – text

tags – array of strings (e.g., ["vegetarian", "nut-free"])

costPerServing – number (0 allowed)

servingsTotal – integer

servingsAvailable – integer

readyAt – datetime (when meal will be ready)

zip – string (MVP: "93230")

status – enum: "open" | "closed" | "cancelled"

createdAt – datetime

updatedAt – datetime

4.3 Reservation

A diner reserving servings from a meal.

Fields:

id – unique identifier

userId – reference to User (the diner)

mealId – reference to Meal

servings – integer

status – enum: "requested" | "confirmed" | "completed | "cancelled"

createdAt – datetime

updatedAt – datetime

Behavior notes:

When a reservation is confirmed, Meal.servingsAvailable should be reduced.

When a reservation is cancelled, servingsAvailable may be increased back (MVP decision).

For MVP, we can auto-confirm reservations as long as servings are available.

5. API Endpoints (MVP)
5.1 Health

GET /health

Purpose: Check if server is alive.

Auth: None.

Response: { "status": "ok" }

5.2 Auth

Base: /auth

POST /auth/register

Body:

name

email

password

role ("cook" | "diner" | "both")

zip (MVP must equal "93230")

Response: user object (without password) + token.

POST /auth/login

Body:

email

password

Response: user object (without password) + token.

5.3 Meals

Base: /meals

POST /meals

Auth: required.

Body:

title

description

tags (optional array)

costPerServing

servingsTotal

readyAt

Behavior:

Set servingsAvailable = servingsTotal.

Set zip from user’s zip.

Only allow zip "93230" for now.

GET /meals

Query params:

zip (optional, default "93230")

from (optional ISO date – list meals from this date/time forward)

freeOnly (optional boolean)

Response: list of upcoming meals.

GET /meals/:id

Response: one meal + maybe aggregated reservation info (later).

GET /meals/mine

Auth: required.

Response: list of meals created by current user.

PATCH /meals/:id

Auth: required.

Allows:

Updating fields like title, description, status (open/closed/cancelled).

Must validate that the current user owns the meal.

5.4 Reservations

Base: /reservations

POST /meals/:id/reservations

Auth: required.

Body:

servings

Behavior:

Check servingsAvailable on the meal.

If enough available:

Create reservation (status = "confirmed" or "requested", depending on MVP decision).

Decrement servingsAvailable if auto-confirmed.

Response: reservation object.

GET /reservations/mine

Auth: required.

Response: list of reservations where userId = current user.

GET /meals/:id/reservations

Auth: required.

For cooks only (owner of the meal).

Response: list of reservations for that meal.

PATCH /reservations/:id

Auth: required.

Body:

status (confirmed, completed, cancelled)

Behavior:

Only allow:

Diner to cancel their own reservation.

Cook to confirm/complete reservations on their meals.

Adjust servingsAvailable when cancelling (MVP decision: restore capacity or not).

6. Implementation Timeline (Backend-First)

This is a rough plan. “Week” is just a chunk of time, not strict.

Phase 0 (Setup) – ~1 “week”

Goals:

Get backend repo running with a single /health route.

Tasks:

Initialize community-meals-backend:

npm init or pnpm init

Install Express and basic dependencies.

Create server.mjs:

Load Express.

Add /health route.

Listen on a port (e.g., 4000).

Add src/ structure (routes, controllers, services, etc.).

Add basic logger.mjs and errorHandler.mjs middleware.

Definition of Done:

You can run node server.mjs (or npm run dev) and hit GET /health in a browser or Postman and see { "status": "ok" }.

Phase 1 (Auth) – ~1 “week”

Goals:

Users can register and log in.

JWT-based auth middleware works.

Tasks:

Choose a database and wire src/db/index.mjs.

Create User model.

Implement authService.mjs:

registerUser

loginUser

password hashing + verification.

Implement authController.mjs + auth.mjs route file.

Implement authMiddleware.mjs to decode JWT and attach req.user.

Definition of Done:

POST /auth/register creates a user.

POST /auth/login returns JWT.

A protected test route like GET /meals/mine returns 401 without token and 200 with token.

Phase 2 (Meals API) – ~1–2 “weeks”

Goals:

Cooks can create and manage meals.

Diners can list and view meals.

Tasks:

Create Meal model.

Implement:

mealsService.mjs (create, list, get by id, list mine, update).

mealsController.mjs.

meals.mjs routes file.

Enforce zip = "93230" in meal creation.

Implement filters in GET /meals (zip, from, freeOnly).

Use auth middleware to:

Ensure only authenticated users create meals.

Ensure only the owning cook can update their meal.

Definition of Done:

You can:

Register as a user with zip 93230.

Login, get token.

Call POST /meals to create a meal.

Call GET /meals to list them.

Call GET /meals/mine to see your own meals.

Phase 3 (Reservations) – ~1–2 “weeks”

Goals:

Diners can reserve servings.

Cooks can view and manage reservations.

Tasks:

Create Reservation model.

Implement:

reservationsService.mjs (create, list mine, list for meal, update status).

reservationsController.mjs.

Routes in reservations.mjs and/or meals.mjs (POST /meals/:id/reservations).

Add logic to adjust servingsAvailable on meals.

Add basic validation:

No reservations for closed/cancelled meals.

No overbooking beyond servingsAvailable.

Definition of Done:

A diner can:

Login, see meals, reserve servings.

See their reservations with GET /reservations/mine.

A cook can:

See reservations on their meals.

Confirm, complete, or cancel reservations.

Phase 4 (Polish & Safety) – ~1 “week”

Goals:

Make API consistent and not terrible to use.

Add some minimal safety/disclaimer support.

Tasks:

Review responses: consistent JSON shapes and status codes.

Add validation and better error messages in validators.mjs.

Add optional endpoint:

GET /info/safety → returns static text about food safety disclaimers (frontend can show it).

Add any seed script for local testing with dummy users/meals.

Definition of Done:

API is reasonably stable for the mobile client to start integrating.

You can run a seed script and then demo:

One cook user.

One diner user.

A meal with open servings.

A reservation created and updated.

7. GitHub Usage (Backend)

Suggested GitHub milestones:

Backend Phase 0 – Setup & Health

Backend Phase 1 – Auth

Backend Phase 2 – Meals

Backend Phase 3 – Reservations

Backend Phase 4 – Polish & Safety

Under each milestone, create Issues like:

“Create server.mjs with /health route”

“Wire DB client (choose and configure database)”

“Implement User model and authService”

“Implement Meal model and mealsService”

“Implement Reservation model and reservationsService”

etc.

Each time something is finished, update docs/STATUS.md and close the corresponding issue.

End of MVP backend plan.


---

## 3. Optional: Tiny STATUS.md update

If you want to sync your status doc right now, you can tweak `docs/STATUS.md` to something like:

```markdown
## Summary for GPT (paste this section into new chats)

- Repo: `community-meals`
- Current focus: Backend Phase 0 – setup Express server and /health route.
- Last completed step: Created repo structure and wrote detailed backend MVP plan in `docs/MVP-plan.md`.
- Next 1–3 tasks:
  1. Initialize `community-meals-backend` with package.json and basic dependencies.
  2. Create `server.mjs` with Express and `/health` route.
  3. Add basic folder structure under `src/`.

---


Then when you’re ready to actually start coding the backend, paste that “Summary for GPT” into your next message and say:

Let’s build server.mjs and the /health route.

And we’ll write that full file from scratch, nice and clean.
In C:\community-meals\community-meals-backend\STATUS.md, you can add or replace the summary with something like:

## Summary for GPT

- Repo: `community-meals`
- Project: Community Meals – home-cooked meal sharing pilot for 93230.
- Current focus: Backend MVP complete (auth + meals + reservations), next step is frontend client.

### Backend status

- Server:
  - `server.mjs` using Express, CORS, dotenv, JSON body parsing.
  - `GET /health` working.

- Auth:
  - `POST /auth/register` with roles (`cook`/`diner`) and zip locked to `93230`.
  - `POST /auth/login` returns `{ user, token }` (JWT).
  - In-memory users stored in `src/db/index.mjs` + `src/db/models/User.mjs`.

- Meals:
  - `POST /meals` (auth, cook) creates meals with `costPerServing >= 0` and no upper cap.
  - `GET /meals` returns open meals (filters: `zip`, `from`, `freeOnly`).
  - `GET /meals/:id`, `GET /meals/mine`, `PATCH /meals/:id` all working.

- Reservations:
  - `POST /meals/:id/reservations` lets diners reserve servings.
  - `GET /meals/:id/reservations` lets cooks see reservations for their meals.
  - `GET /reservations/mine` lists the current user’s reservations.
  - `PATCH /reservations/:id` updates status with rules:
    - Diner can cancel their own reservation.
    - Cook can confirm/complete/cancel reservations on their meals.
  - Servings availability is decremented on confirmed reservations and restored on cancellation.

### Next suggested steps

1. Write a BACKEND-API.md with endpoint docs (methods, URLs, sample requests/responses).
2. Start the `community-meals-client`:
   - Simple login screen hitting `/auth/login`.
   - Meals list calling `GET /meals`.
   - Meal detail + “Reserve” button calling `POST /meals/:id/reservations`.


That way future-you (and future-me) can instantly know where the backend stands.

3️⃣ Optional: API doc file for GitHub

If you want something to drop straight into docs/BACKEND-API.md, I can draft that next so your GitHub repo looks pro from day one and you can hand this backend to any front-end dev (including… also you 😅).

From there, we pivot into the client and start wiring a minimal “log in → see chili → reserve a bowl” flow off this API.

You said:
Lets do the API
ChatGPT said:
Thought for 22s

Nice, API time. 😎
Here’s a ready-to-drop-in file for docs/BACKEND-API.md.

Create C:\community-meals\docs\BACKEND-API.md and paste this:

# Community Meals – Backend API (MVP)

Pilot: **93230 zip code** (Hanford, CA)  
Status: **MVP backend working** – in-memory DB, dev only.

Base URL for local dev:

```text
http://localhost:4000


All data (users, meals, reservations) is stored in memory and resets every time you restart npm run dev.

Auth & Conventions
Authentication

Most write operations require a JWT in the Authorization header:

Authorization: Bearer <YOUR_JWT_TOKEN_HERE>


You get this token from POST /auth/login (or immediately after POST /auth/register).

Roles

For the MVP there are two roles:

cook – can create meals, see reservations for their meals.

diner – can reserve servings from meals and manage their own reservations.

Zip code limitation

For now, registration is limited to:

zip = "93230"


Any other zip returns 400 with an error.

Error format

All errors are returned as JSON:

{
  "error": "Message explaining what went wrong"
}


Common status codes:

400 – Bad request (missing fields, invalid data)

401 – Unauthorized (missing/invalid token)

403 – Forbidden (you don’t own this resource / not allowed)

404 – Not found (resource doesn’t exist)

500 – Unexpected server error

1. Health
GET /health

Basic health check – useful for monitoring and “is the server up?”.

Request

GET /health


Response 200

{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2025-12-10T13:00:00.000Z"
}

2. Auth Endpoints
POST /auth/register

Register a new user (either cook or diner) for the 93230 pilot.

Request body

{
  "name": "Test Cook",
  "email": "cook@example.com",
  "password": "password123",
  "role": "cook",
  "zip": "93230"
}


role must be "cook" or "diner".

zip must be "93230" in this MVP.

Successful response 201

{
  "user": {
    "id": "user_2",
    "name": "Test Cook",
    "email": "cook@example.com",
    "role": "cook",
    "zip": "93230",
    "createdAt": "2025-12-10T13:09:29.975Z",
    "updatedAt": "2025-12-10T13:09:29.975Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}


Possible errors

400 – missing required fields or zip not 93230

409 – email already registered

POST /auth/login

Log in an existing user using email + password.

Request body

{
  "email": "cook@example.com",
  "password": "password123"
}


Successful response 200

{
  "user": {
    "id": "user_2",
    "name": "Test Cook",
    "email": "cook@example.com",
    "role": "cook",
    "zip": "93230",
    "createdAt": "2025-12-10T13:09:29.975Z",
    "updatedAt": "2025-12-10T13:09:29.975Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}


Possible errors

400 – missing email or password

401 – invalid email or password

3. Meals Endpoints

Meals represent offers of home-cooked food from cooks.

Common Meal Fields
{
  "id": "meal_3",
  "userId": "user_2",
  "title": "Big Pot of Chili",
  "description": "Spicy beef chili, beans, toppings.",
  "tags": ["beef", "spicy"],
  "costPerServing": 5,
  "servingsTotal": 10,
  "servingsAvailable": 8,
  "readyAt": "2025-12-10T20:00:00.000Z",
  "zip": "93230",
  "status": "open",
  "createdAt": "2025-12-10T15:03:49.242Z",
  "updatedAt": "2025-12-10T15:08:05.390Z"
}


costPerServing: no upper cap, must be >= 0.

status: "open" | "closed" | "cancelled" (MVP uses "open" by default).

GET /meals

Public list of currently open meals (no auth required).

Query parameters (optional)

zip – filter by zip (default "93230")

from – ISO date string; only meals with readyAt >= from

freeOnly – true to show only meals with costPerServing === 0

Example

GET /meals
GET /meals?freeOnly=true
GET /meals?zip=93230&from=2025-12-10T18:00:00.000Z


Response 200

[
  {
    "id": "meal_3",
    "userId": "user_2",
    "title": "Big Pot of Chili",
    "description": "Spicy beef chili, beans, toppings.",
    "tags": ["beef", "spicy"],
    "costPerServing": 5,
    "servingsTotal": 10,
    "servingsAvailable": 8,
    "readyAt": "2025-12-10T20:00:00.000Z",
    "zip": "93230",
    "status": "open",
    "createdAt": "2025-12-10T15:03:49.242Z",
    "updatedAt": "2025-12-10T15:08:05.390Z"
  }
]

GET /meals/:id

Get details for a single meal by ID.

Example

GET /meals/meal_3


Response 200

Same as one entry in /meals.

Errors

404 – meal not found

GET /meals/mine (auth required)

List meals created by the currently authenticated user (cook).

Headers

Authorization: Bearer <token>


Example

GET /meals/mine


Response 200

[
  {
    "id": "meal_3",
    "userId": "user_2",
    "title": "Big Pot of Chili",
    "description": "Spicy beef chili, beans, toppings.",
    "tags": ["beef", "spicy"],
    "costPerServing": 5,
    "servingsTotal": 10,
    "servingsAvailable": 8,
    "readyAt": "2025-12-10T20:00:00.000Z",
    "zip": "93230",
    "status": "open",
    "createdAt": "2025-12-10T15:03:49.242Z",
    "updatedAt": "2025-12-10T15:08:05.390Z"
  }
]


Errors

401 – missing/invalid token

POST /meals (auth required, cook)

Create a new meal. In this MVP there’s no code-level restriction on role, but the intent is that cooks use this.

Headers

Authorization: Bearer <token>
Content-Type: application/json


Request body

{
  "title": "Big Pot of Chili",
  "description": "Spicy beef chili, beans, toppings.",
  "tags": ["beef", "spicy"],
  "costPerServing": 5,
  "servingsTotal": 10,
  "readyAt": "2025-12-10T20:00:00.000Z"
}


costPerServing – non-negative number (>= 0). No upper cap.

servingsTotal – number >= 1.

readyAt – ISO date string.

Response 201

{
  "id": "meal_3",
  "userId": "user_2",
  "title": "Big Pot of Chili",
  "description": "Spicy beef chili, beans, toppings.",
  "tags": ["beef", "spicy"],
  "costPerServing": 5,
  "servingsTotal": 10,
  "servingsAvailable": 10,
  "readyAt": "2025-12-10T20:00:00.000Z",
  "zip": "93230",
  "status": "open",
  "createdAt": "2025-12-10T15:03:49.242Z",
  "updatedAt": "2025-12-10T15:03:49.242Z"
}


Errors

400 – missing/invalid fields

401 – missing/invalid token

PATCH /meals/:id (auth required, must own meal)

Update an existing meal. Only the user who created the meal can update it.

Headers

Authorization: Bearer <token>
Content-Type: application/json


Request body (any subset of these fields)

{
  "title": "Updated Chili",
  "description": "Mild version with less spice.",
  "tags": ["beef", "mild"],
  "costPerServing": 7,
  "servingsTotal": 12,
  "servingsAvailable": 10,
  "readyAt": "2025-12-10T21:00:00.000Z",
  "status": "open"
}


status must be one of: "open", "closed", "cancelled".

costPerServing >= 0 if present.

servingsTotal >= 1 if present.

Response 200

Returns updated meal object.

Errors

401 – missing/invalid token

403 – user does not own the meal

404 – meal not found

400 – invalid status or invalid numeric fields

4. Reservations Endpoints

Reservations represent a diner claiming a number of servings from a meal.

Common Reservation Fields
{
  "id": "resv_4",
  "userId": "user_1",       // diner
  "mealId": "meal_3",
  "servings": 2,
  "status": "confirmed",    // "confirmed" | "completed" | "cancelled"
  "createdAt": "2025-12-10T15:08:05.390Z",
  "updatedAt": "2025-12-10T15:08:05.390Z"
}

POST /meals/:id/reservations (auth required, diner)

Create a reservation for a given meal.

Headers

Authorization: Bearer <token>
Content-Type: application/json


Request body

{
  "servings": 2
}


Rules:

servings must be a number ≥ 1.

Meal must exist, be "open", and have enough servingsAvailable.

For MVP, reservations are automatically created with status: "confirmed".

Response 201

{
  "id": "resv_4",
  "userId": "user_1",
  "mealId": "meal_3",
  "servings": 2,
  "status": "confirmed",
  "createdAt": "2025-12-10T15:08:05.390Z",
  "updatedAt": "2025-12-10T15:08:05.390Z"
}


Side effect

servingsAvailable on the meal is decreased by servings.

Errors

400 – invalid servings, not enough available, or meal not open

401 – missing/invalid token

404 – meal not found

GET /meals/:id/reservations (auth required, cook only)

List reservations for a specific meal. Only the cook who owns the meal can call this.

Headers

Authorization: Bearer <token>


Example

GET /meals/meal_3/reservations


Response 200

[
  {
    "id": "resv_4",
    "userId": "user_1",
    "mealId": "meal_3",
    "servings": 2,
    "status": "confirmed",
    "createdAt": "2025-12-10T15:08:05.390Z",
    "updatedAt": "2025-12-10T15:08:05.390Z"
  }
]


Errors

401 – missing/invalid token

403 – user is not the cook who created the meal

404 – meal not found

GET /reservations/mine (auth required)

List reservations created by the current user (diner or cook).

Headers

Authorization: Bearer <token>


Example

GET /reservations/mine


Response 200

[
  {
    "id": "resv_4",
    "userId": "user_1",
    "mealId": "meal_3",
    "servings": 2,
    "status": "confirmed",
    "createdAt": "2025-12-10T15:08:05.390Z",
    "updatedAt": "2025-12-10T15:08:05.390Z"
  }
]


Errors

401 – missing/invalid token

PATCH /reservations/:id (auth required)

Update the status of a reservation.

Headers

Authorization: Bearer <token>
Content-Type: application/json


Request body

{
  "status": "cancelled"
}


Allowed statuses: "confirmed", "completed", "cancelled".

Rules:

Diner (reservation owner):

Can only set status: "cancelled" on their own reservations.

Cook (who owns the meal):

Can set "confirmed", "completed", or "cancelled" for reservations on their meals.

If a reservation moves from "confirmed" → "cancelled", meal servingsAvailable increases by servings.

Response 200

{
  "id": "resv_4",
  "userId": "user_1",
  "mealId": "meal_3",
  "servings": 2,
  "status": "cancelled",
  "createdAt": "2025-12-10T15:08:05.390Z",
  "updatedAt": "2025-12-10T15:12:30.000Z"
}


Errors

400 – invalid status

401 – missing/invalid token

403 – user is neither the diner nor the cook, or diner tried to set disallowed status

404 – reservation or meal not found

5. Notes & Next Steps

Storage: All data is in-memory (src/db/index.mjs). Restarting the server wipes everything.

Security: JWT secret is loaded from .env (JWT_SECRET), falling back to a dev default. For real deployment, .env is required.

Price policy: costPerServing enforced as non-negative, no upper bound; market sets the price.

Suggested future improvements

Persistent DB (SQLite/Postgres) instead of in-memory.

Stronger role enforcement (cook vs diner in middleware).

Soft limits and validation around extremely high prices (policy-based, not hard-coded).

Basic rate limiting and logging for production.


---

If you want, next I can:

- Trim this into a smaller “quick reference” section for the main `README.md`, or  
- Jump over to the **client** and start wiring a super simple flow:
  - Login screen → hits `/auth/login`
  - Meals list → hits `/meals`
  - “Reserve” button → hits `/meals/:id/reservations` with that JWT.

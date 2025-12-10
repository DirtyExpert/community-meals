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

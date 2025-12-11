# Community Meals – 93230 Pilot

Starter repo structure for the Community Meals app.
# Community Meals – 93230 Pilot

> A learning project by a beginner developer, using AI (ChatGPT) as a coding partner.

This app is an experiment to help neighbors in **93230 (Hanford, CA)** share home-cooked meals for free or low cost.

- **Cooks** can post meals they’ve made, how many portions they have, and when they’re available.
- **Neighbors/Diners** can browse available meals and reserve portions.
- The goal is to start very small and learn while building.

---

## Project status & learning approach

This repo is intentionally being built by someone with **little or no formal programming experience**.

Because of that:

- Most code will be written **with the help of ChatGPT (GPT)**.
- Changes should be made **slowly**, with understanding, not just copy-pasting random snippets.
- Before GPT writes or rewrites code, it should always:
  1. See the **current full file** (not just a small snippet).
  2. Understand the **purpose of that file** in the app.
  3. Then return either:
     - A **full updated version** of the file, or  
     - A very clear patch/diff that can be applied safely.

If you’re reading this in the future and helping with the code:
- Please prefer **full file replacements** over partial snippets.
- Keep the docs in sync, especially `docs/MVP-plan.md` and `docs/STATUS.md`.

---

## Docs

- `docs/MVP-plan.md` – high-level feature outline and milestones for the MVP.
- `docs/STATUS.md` – short, current snapshot of what’s done and what’s next  
  (used to keep GPT and humans on the same page).

When starting a new coding session with GPT, the **top section** of `docs/STATUS.md` should be pasted into the chat so GPT knows the current state of the project.

---

## Structure

Planned structure (may evolve):

```text
community-meals/
  README.md
  docs/
    MVP-plan.md      # Overall spec and milestones
    STATUS.md        # Short status summary + dev log
  community-meals-client/
    src/
      screens/
      components/
      api/
      theme/
      utils/
  community-meals-backend/
    src/
      routes/
      controllers/
      services/
      db/
        models/
      middleware/
      utils/
3. Minimal README so anyone can run it

In the repo root, open README.md and make sure there’s at least something like this (you can paste this under whatever’s there, or replace if it’s empty and you want it short):

# Community Meals (Hanford 93230 pilot)

Simple pilot app where home cooks in 93230 can post extra plates and neighbors can reserve them.

## Stack

- Frontend: React (Vite) in `community-meals-client`
- Backend: Node + Express API in `community-meals-backend`

## Running locally

### Backend

```bash
cd community-meals-backend
npm install
npm run dev


Backend defaults to http://localhost:4000.

Frontend
cd community-meals-client
npm install
npm run dev


Frontend defaults to http://localhost:5173.

Make sure the backend is running before you try to create meals or reservations.

Core flows

Sign in / Join pilot
Enter name, email, and password. App will:

Try to log you in.

If that fails, auto-register you as a cook in 93230.

Post a meal
On the main page you can:

Set title, date/time, servings, cost per serving, location, and notes.

Post a meal and see it in the feed.

Reserve a meal
From the list, tap Reserve 1 serving to create a reservation.
View your reservations on the My reservations page.


That’s enough for someone (or future you) to fire it up without asking questions.

---

## 4. Git: commit and push so it’s “frozen”

From the repo root on your machine:

```bash
git status


If it shows changes in the client (App.jsx, MealsListPage, App.css, etc.) and maybe backend, then:

git add .
git commit -m "Polish MVP: social landing, reservations page, nav wired"
git push origin main


(If your main branch is named something else, swap that in.)

Once that’s pushed, Community Meals MVP is locked in GitHub and we don’t have to think about it while we tear into the Mel app.

5. Call it “good enough for v1”

Functionally, with what you’ve got now:

Cooks can sign in / auto-register

Cooks can post meals

Diners/cooks can reserve

They can see their reservations

There’s a social-style landing/hero that sells the concept

That’s a legit v1 pilot. Anything else (cook profile pages, photos, ratings, etc.) is v2/v3 territory.
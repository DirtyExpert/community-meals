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

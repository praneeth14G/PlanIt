# Instructions (read this first in a new session)

This file is the condensed reference for this project. Read this instead of
the original assignment PDF or the full planning conversation — it has
everything needed to keep working. `PROGRESS.md` next to this file has the
current state (what's done / in flight / next).

## What this is

Frontend internship take-home assignment. Build a React app: free-text input
→ real LLM call → model returns structured JSON (not chat text) → app
renders it as interactive, stateful UI. 8-hour time budget. Follow-up
interview: demo it, walk through the code, fix an injected bug, add a small
feature live — so the code needs to be genuinely understood, not just working.

Graded on: React/architecture (25%), AI integration & data handling (25%),
**handling bad AI output (20% — the main signal)**, UI/UX (15%),
communication (15%).

## What we're building

**Trip planner.** User describes a trip in free text → Gemini returns a
day-by-day itinerary as JSON → UI lets the user expand/collapse days, remove
stops, and reorder stops within a day (up/down buttons, not drag-and-drop —
more reliable on mobile touch and easier to explain live).

## Stack & architecture

- `frontend/` — Vite + React 19 + TypeScript. Talks only to `/api/*` on the
  same origin (Vite dev proxy → `server/`, see `vite.config.ts`).
- `server/` — Express 5 + TypeScript. Holds `GEMINI_API_KEY` (never sent to
  the browser). One route: `POST /api/plan-trip`.
- `shared/` — Zod schema (`itinerary.ts`) that is the single source of truth
  for "what does a valid itinerary look like." Both frontend and backend
  import it.
- AI: Google Gemini (`@google/genai`), called with `responseSchema`/JSON mode
  so the model is constrained toward the right shape at generation time.
  This reduces bad output but does **not** replace validation — the backend
  still runs the raw response through the Zod schema before it ever reaches
  the client.
- npm workspaces monorepo (root `package.json` lists `shared`, `server`,
  `frontend`). `npm install && npm start` from repo root runs both frontend
  and backend together via `concurrently`.

## The reliability design (this is the point of the assignment)

1. Backend validates the model's JSON with the shared Zod schema before
   responding; on failure it returns `{ error: { code, message } }` with a
   proper status — never partial/unvalidated data.
2. Gemini call has a 20s timeout (`withTimeout` in `server/src/gemini.ts`)
   distinct from a generic model-error.
3. Frontend (`useTripPlanner.ts`) aborts the previous in-flight request on
   resubmit *and* double-checks a request id before applying a response —
   two independent guards against a stale response overwriting a newer one.
4. State is an explicit `idle | loading | error | success` reducer, not
   scattered booleans — impossible states (loading+error both true) can't happen.
5. A failed retry keeps the last good itinerary on screen with the error
   banner on top, and keeps the user's typed input intact — nothing gets wiped.
6. Once validated at the API boundary, components trust the shape — no
   defensive optional-chaining sprinkled through the render layer.

## Conventions to keep following

- Minimal comments; no AI-flavored comment style. Only comment genuinely
  non-obvious *why*, not *what*.
- Don't make every function/component look mechanically identical — small
  natural variation is fine and expected in hand-written code.
- Commit messages: plain, personal voice, not templated conventional-commits
  boilerplate. Small, meaningful commits over one giant one.
- TypeScript is in use but not graded — don't over-invest in fighting the
  type system; pragmatic > perfectly typed.

## Key files

- `shared/src/itinerary.ts` — the data contract (Zod schema + types)
- `server/src/gemini.ts` — model call, prompt, timeout
- `server/src/routes/plan.ts` — validation + error normalization
- `frontend/src/hooks/useTripPlanner.ts` — the state machine
- `frontend/src/lib/api.ts` — fetch wrapper, assigns client-side stop ids
- `frontend/src/components/` — `TripForm`, `StatusBanner`, `ItineraryView`,
  `DayCard`, `StopRow`

## Running it

```
cp server/.env.example server/.env   # then paste in a Gemini API key
npm install
npm start                             # runs backend :8787 + frontend :5173
```

Get a free Gemini key at https://aistudio.google.com/apikey.

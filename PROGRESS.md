# Progress

Read `INSTRUCTIONS.md` first if this is a new session. This file is just
"what's done, what's next" — update it after each work chunk.

## Done

- [x] Monorepo scaffolded: `shared` (Zod schema), `server` (Express + Gemini
      call + validation route), `frontend` (Vite React TS)
- [x] `shared/src/itinerary.ts` — itinerary/day/stop Zod schema + types
- [x] `server/src/gemini.ts` — Gemini call with `responseSchema` JSON mode +
      20s timeout
- [x] `server/src/routes/plan.ts` — `POST /api/plan-trip`, validates model
      output against the shared schema, normalized error responses
- [x] `frontend/src/hooks/useTripPlanner.ts` — idle/loading/error/success
      reducer, abort + request-id stale-response guard
- [x] `frontend/src/lib/api.ts` — fetch wrapper, assigns client-side stop ids
- [x] Components: `TripForm`, `StatusBanner`, `ItineraryView`, `DayCard`
      (expand/collapse), `StopRow` (remove + move up/down)
- [x] Basic responsive CSS pass (not yet tested on a real phone/narrow viewport)
- [x] Both `server` and `frontend` type-check clean (`tsc --noEmit`)
- [x] Root `npm install` works across the workspace

## In flight / next

- [x] git init + first commit (scaffold committed)
- [x] Smoke-tested without a real key: missing/invalid key correctly returns
      a clean 502 `MODEL_ERROR` (not a crash), empty/missing prompt correctly
      returns 400 `INVALID_INPUT`, and the Vite dev proxy correctly forwards
      `/api/*` to the Express server. Dev servers are running in the
      background (backend :8787, frontend :5173).
- [x] Real Gemini key wired in, end-to-end verified via curl: a real trip
      prompt returns a fully-valid itinerary matching the shared schema
      exactly (HTTP 200, no validation errors). Note: `gemini-2.5-flash`
      returned a 404 ("no longer available to new users") — switched to
      `gemini-flash-latest` (an alias Google keeps pointed at their current
      recommended flash model, so it won't go stale like a pinned version
      number would).
- [ ] Haven't visually verified the browser UI yet (no browser-automation
      tool available in this environment) — opened `localhost:5173` for the
      user to check directly. Need their confirmation that rendering,
      expand/collapse, remove, and reorder all work as expected.
- [ ] Deliberately break things to verify failure handling: bad/missing API
      key, a prompt likely to produce truncated/malformed output, rapid
      double-submit (confirm no stale-response overwrite)
- [ ] Real mobile viewport test (not just CSS review)
- [ ] README.md (setup, usage, AI-usage note, limitations, time spent) —
      not started yet, currently only has Vite's default content
- [ ] Screen recording of the app working
- [ ] Stretch, only if time remains: refinement loop > localStorage session
      save > dark mode/animation (in that priority order per the plan)

## Open decisions

- None currently open — architecture decisions are locked in per
  `INSTRUCTIONS.md`.

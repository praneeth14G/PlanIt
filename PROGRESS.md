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
- [x] Browser UI confirmed working by user (rendering, expand/collapse,
      remove, reorder all checked out in a real browser at localhost:5173).
- [x] Deliberately broke each failure path and confirmed clean handling,
      no crashes:
      - missing API key → 502 `MODEL_ERROR`
      - artificially tiny timeout → 504 `TIMEOUT` (confirmed the
        `withTimeout` race actually fires, then reverted to the real 20s)
      - empty model response, unparseable JSON, and schema-mismatched JSON
        (stubbed via temporary test-only branches in `generateItinerary`,
        removed immediately after) → each returns the right `BAD_SHAPE`/
        `MODEL_ERROR` code, never a crash
      - backend killed entirely while frontend up → Vite proxy returns a
        502 with an empty body; tightened `frontend/src/lib/api.ts` to give
        a distinct "couldn't reach the server" message for that case
        instead of a confusing "wasn't valid JSON" message
      - `shared/src/itinerary.ts` schema itself checked against 7 malformed
        shapes (empty object, wrong types, missing required fields, null,
        array-instead-of-object) — all correctly rejected, only a valid
        shape accepted
- [x] User manually tested rapid double-submit and found a real bug: the
      submit button was disabled while `state.status === "loading"`, so a
      second submit could never actually fire — the abort/stale-response
      guard in `useTripPlanner.ts` was correct but unreachable. Fixed by no
      longer disabling submit during loading (`TripForm` now takes
      `isLoading` just for the button label, not to gate it); resubmitting
      now aborts the in-flight request and starts a fresh one, which is
      exactly what the guard is for. Re-verify in browser after this fix.
- [x] Mobile layout confirmed working by user.
- [x] Double-submit fix re-verified working by user in the browser.
- [x] README.md written: setup, usage, architecture, AI-usage note, known
      limitations all filled in. Only "time spent" is still a placeholder.
- [x] Renamed app from "Trip Planner" to **PlanIt** (title, header, README).
- [x] UI/UX polish pass: smooth grid-based expand/collapse transition on day
      cards (no JS height measuring), fade-in on the itinerary appearing,
      small header logo mark, more visible idle/empty state, subtle card
      hover shadow.
- [x] **Refinement loop implemented** (stretch goal): `RefineBar` component,
      `/api/plan-trip` now optionally takes `currentItinerary`, backend
      prompts Gemini with that as context + the follow-up instruction and
      re-validates the full response through the same schema/pipeline as a
      fresh plan. Tested end-to-end via curl with a real instruction
      ("replace the museum on day 1 with something outdoors") — Gemini
      correctly swapped only that one stop and left the rest of the
      itinerary untouched.
- [x] `retry()` reworked to replay whichever action failed (plan or refine)
      via a `lastArgsRef`, instead of always re-submitting the original prompt.

- [x] Mobile re-verified by user after the rename/polish/refinement-loop
      changes — header/logo, day-card expand animation, and the new refine
      bar all confirmed working on a small screen.
- [x] Wrote `~/PlanIt_Interview_Prep.txt` (outside this folder, per request)
      — a study doc covering what the app does, the architecture and why,
      a file-by-file walkthrough, the full reliability design broken down
      mechanism by mechanism, the refinement loop's design tradeoff, both
      real bugs found during dev, deliberate non-goals, and a Q&A section
      tied back to the assignment PDF's requirements.

- [x] Time spent filled into README (~9h: 8h core budget + ~1h refinement
      loop stretch), broken down by phase.
- [x] GitHub repo created (public) and pushed: https://github.com/praneeth14G/PlanIt
      — installed `gh` via Homebrew, user authenticated via `gh auth login`
      (device code flow), `gh repo create` + `gh auth setup-git` + push.
- [x] Deployment prep, attempt 1 (Render): added render.yaml, configurable
      `VITE_API_URL` in the frontend, non-watch prod start script for the
      server. Hit two real blockers trying to actually deploy: Render's
      blueprint validation rejected `plan: free` for web services, and
      after working around that it asked for billing details even for the
      free tier.
- [x] **Switched deployment target to Vercel** (no card required for hobby
      projects). Removed render.yaml. Refactored the plan-trip logic out of
      the Express route into `server/src/planTrip.ts` — a plain,
      framework-agnostic `handlePlanTrip()` function — so both
      `server/src/routes/plan.ts` (Express, local dev) and the new
      `api/plan-trip.ts` (Vercel serverless function, production) are thin
      adapters over the exact same logic. Added `vercel.json` (single
      project: static frontend build + the api function on the same
      origin, no cross-origin config needed). Verified locally end-to-end
      after the refactor — identical behavior to before.
- [x] Updated `INSTRUCTIONS.md` and `~/PlanIt_Interview_Prep.txt` to reflect
      the Vercel architecture and the Render→Vercel pivot story (a good,
      honest thing to be able to explain live if asked).

## In flight / next

- [ ] Actually deploy on Vercel and get the live URL — trying the `vercel`
      CLI directly (avoids the GitHub-App-repo-connection friction hit with
      Render's dashboard flow).
- [ ] Once live: add the URL to the README's "Live demo" line, commit, push.
- [ ] Screen recording — still needed for submission, a user-side action.

## Open decisions

- None currently blocking — see "In flight / next" above for what's left.

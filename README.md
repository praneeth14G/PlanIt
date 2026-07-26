# PlanIt

Describe a trip in plain language, get back a day-by-day itinerary you can
expand, tweak, reorder, and refine with follow-up instructions — not a chat
transcript.

**Live demo:** _(link goes here once deployed)_

## Setup

```bash
git clone <this repo>
cd Flam
cp server/.env.example server/.env   # paste in a Gemini API key
npm install
npm start
```

Get a free Gemini API key at https://aistudio.google.com/apikey (no billing
required for the free tier).

`npm start` runs the backend (`http://localhost:8787`) and the frontend
(`http://localhost:5173`) together. Open the frontend URL.

## Usage

Type a trip description (destination, length, pace, interests) — or click
one of the example prompts — and submit. Once the itinerary comes back:

- Click a day to expand/collapse it
- Use the up/down arrows on a stop to reorder it within its day
- Use the × to remove a stop
- Use the "tweak it" bar below the itinerary to apply a follow-up
  instruction (e.g. "swap day 2's museum for something outdoors") without
  starting over

## Architecture

- `frontend/` — Vite + React + TypeScript
- `server/` — small Express + TypeScript backend that holds the Gemini API
  key and proxies the model call (key never reaches the browser)
- `shared/` — a Zod schema that's the single source of truth for the
  itinerary shape, imported by both frontend and backend

The model is called with Gemini's structured-output mode so it's constrained
toward the right JSON shape at generation time — but the backend still
validates every response against the shared schema before it reaches the
client, and normalizes any failure into a clear error rather than passing
along anything malformed.

The refinement loop ("tweak it") reuses the exact same endpoint and
validation path as the initial plan: the backend just includes the current
itinerary as context alongside the follow-up instruction and asks Gemini for
the whole itinerary back, edited. It's not a true JSON diff/patch — a
deliberate simplicity tradeoff so the same reliability guarantees apply to
both without a second code path to maintain.

## AI-usage note

I used Claude Code throughout — for scaffolding the monorepo, writing the
initial implementation of the components/hooks/backend route, and for
debugging (e.g. it caught that `gemini-2.5-flash` had been deprecated for
new API keys by reading the actual error from the API and switching to
`gemini-flash-latest`). I drove the architecture decisions (the reliability
design — timeout, stale-response guard, validation boundary — is the actual
point of this assignment, so I made sure I understood and could defend every
piece of it, not just accepted what was generated).

Worth calling out: manual testing caught a real bug that code review alone
missed — the submit button was disabled while a request was loading, which
meant the resubmit-before-first-response scenario (the whole reason the
abort/request-id guard exists) could never actually be triggered. The guard
code was correct; the UI in front of it silently made it unreachable. Fixed
by only using loading state for the button label, not to gate the button.

## Known limitations

- No automated test suite — given the 8-hour budget, verification was
  manual/exploratory: deliberately breaking each failure path (bad key,
  artificial timeout, empty/malformed/wrong-shape model output, backend
  killed mid-request) and confirming clean handling, plus manual browser
  testing for interactivity, double-submit, and mobile layout.
- The refinement loop resends the full itinerary as context on every tweak
  rather than diffing — fine at this scale, would need rethinking for very
  long itineraries (token cost/latency).
- No streaming — deliberately skipped. Streaming partial JSON while still
  validating the final shape against the schema adds real complexity and
  works against the reliability focus that's the actual point of this
  assignment, so it wasn't worth the tradeoff in the time available.
- No session save/reload (stretch goal, not implemented).
- Dark mode follows the OS/browser preference automatically; there's no
  in-app manual toggle.
- Reordering is within a day only — no moving a stop to a different day.
- Primarily tested in Chrome/Safari on macOS; not tested against older
  browsers.

## Deployment

Deployed on [Render](https://render.com) as two free-tier services from this
repo, defined in `render.yaml`: a static site for `frontend/` and a web
service for `server/` (`GEMINI_API_KEY` set as a Render secret, never
committed). Locally the frontend talks to the backend through Vite's dev
proxy; in production it uses `VITE_API_URL` (set at build time) instead,
since there's no dev proxy once deployed. See `render.yaml` for the exact
build/start commands.

## Time spent

~9 hours total (assignment's 8-hour core budget, plus ~1 hour on the
refinement loop stretch goal beyond that):

- Reading the brief, deciding on trip planner + the overall architecture: 0.5h
- Project scaffolding (Vite + Express + npm workspaces, wiring up the Gemini
  SDK): 1h
- Data contract (Zod schema) + backend route + prompt design: 1.25h
- Frontend state machine + basic itinerary rendering, end to end: 1.25h
- Interactivity (expand/collapse, remove, reorder stops): 1h
- Failure-handling hardening: timeout, abort/stale-response guard,
  deliberately breaking every failure path to confirm clean handling: 1.25h
- Mobile responsive pass + UI polish: 1h
- Refinement loop (stretch goal): 1h
- README, manual testing pass, commits, screen recording: 0.75h

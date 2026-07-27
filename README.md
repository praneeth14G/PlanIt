# PlanIt

Describe a trip in plain language, get back a day-by-day itinerary you can
expand, tweak, reorder, and refine with follow-up instructions — not a chat
transcript.

**Live demo:** https://planit-olive.vercel.app 

## Demo video

[Demo Link](https://drive.google.com/file/d/1DqoRBcMgmowHow84lPsIuK-pY_wtuRvu/view?usp=sharing)

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

Type a trip description (destination, length, pace, interests) or click
one of the example prompts and optionally tap a few "What are you into?"
chips (food, sightseeing, devotional, nature, adventure sports, sports,
shopping, nightlife). Those chips get folded into the prompt sent to Gemini
so the itinerary leans toward what you picked. Submit and once the
itinerary comes back:

- A destination photo appears behind the trip header, pulled live from
  Wikipedia/Wikimedia Commons (free, no API key, openly licensed) falls
  back to a plain gradient if no photo is found for that place
- A short "About {destination}" description and a "Spots you'll visit"
  highlights line appear below the photo, also pulled from Wikipedia's
  summary API. There's no real customer-ratings source that's both free and
  keyless (Google/Foursquare places APIs need your own account and API
  key), so ratings were deliberately left out rather than faked.
- Category filter chips (built from whichever categories the model actually
  used, e.g. "Food & Drink", "Sightseeing") let you show just one kind of
  stop across the whole trip
- Click a day to expand/collapse it
- Use the up/down arrows on a stop to reorder it within its day
- Use the × to remove a stop
- Use "+ Add stop here" between any two stops to insert one of your own
  (name, category, description, time, duration) — every later stop that
  day with a parseable time automatically shifts later by that stop's
  duration, so the rest of the day's schedule stays consistent
- Reordering and adding stops are only available with the "All" filter
  active, to keep stop positions unambiguous
- Use the "tweak it" bar below the itinerary to apply a follow-up
  instruction (e.g. "swap day 2's museum for something outdoors") without
  starting over

## Architecture

- `frontend/` — Vite + React + TypeScript
  - `lib/destinationInfo.ts` — looks up a destination's photo and short
    description via Wikipedia's page-summary REST API directly from the
    browser (no backend involved, in-memory cache per destination, and
    filters out locator-map/diagram images so only real photos are used),
    consumed once per itinerary in `components/ItineraryView.tsx` and
    passed down to `DestinationHero.tsx` and `DestinationAbout.tsx`
  - `lib/categories.ts` — the shared list of interest/category suggestions
    used by both the trip-form chips and the add-stop category field
  - `lib/time.ts` — parses/formats "9:00 AM"-style stop times, used to push
    later stops back when a custom one is inserted
  - `components/SplashScreen.tsx` — the opening compass/logo animation,
    shown for a fixed ~1.7s on every load (`App.tsx` owns the timer)
  - `components/CategoryFilter.tsx`, `components/AddStopForm.tsx` — the
    stop-filtering and custom-stop-insertion UI, both pure client-side state
    (no round trip to the backend)
- `server/` — small Express + TypeScript backend that holds the Gemini API
  key and proxies the model call (key never reaches the browser)
- `shared/` — a Zod schema that's the single source of truth for the
  itinerary shape, imported by both frontend and backend

The model is called with Gemini's structured-output mode so it's constrained
toward the right JSON shape at generation time but the backend still
validates every response against the shared schema before it reaches the
client, and normalizes any failure into a clear error rather than passing
along anything malformed.

The refinement loop ("tweak it") reuses the exact same endpoint and
validation path as the initial plan: the backend just includes the current
itinerary as context alongside the follow-up instruction and asks Gemini for
the whole itinerary back, edited. It's not a true JSON diff/patch a
deliberate simplicity tradeoff so the same reliability guarantees apply to
both without a second code path to maintain.

## AI-usage note

I used Claude Code throughout for scaffolding the monorepo, writing the
initial implementation of the components/hooks/backend route, and for
debugging (e.g. it caught that `gemini-2.5-flash` had been deprecated for
new API keys by reading the actual error from the API and switching to
`gemini-flash-latest`). I drove the architecture decisions (the reliability
design — timeout, stale-response guard, validation boundary is the actual
point of this assignment, so I made sure I understood and could defend every
piece of it, not just accepted what was generated).

Worth calling out: manual testing caught a real bug that code review alone
missed the submit button was disabled while a request was loading, which
meant the resubmit-before-first-response scenario (the whole reason the
abort/request-id guard exists) could never actually be triggered. The guard
code was correct; the UI in front of it silently made it unreachable. Fixed
by only using loading state for the button label, not to gate the button.

## Known limitations

- No automated test suite given the 8-hour budget, verification was
  manual/exploratory: deliberately breaking each failure path (bad key,
  artificial timeout, empty/malformed/wrong-shape model output, backend
  killed mid-request) and confirming clean handling, plus manual browser
  testing for interactivity, double-submit, and mobile layout.
- The refinement loop resends the full itinerary as context on every tweak
  rather than diffing — fine at this scale, would need rethinking for very
  long itineraries (token cost/latency).
- No streaming, deliberately skipped. Streaming partial JSON while still
  validating the final shape against the schema adds real complexity and
  works against the reliability focus that's the actual point of this
  assignment, so it wasn't worth the tradeoff in the time available.
- No session save/reload (stretch goal, not implemented).
- Dark mode follows the OS/browser preference automatically; there's no
  in-app manual toggle.
- Reordering is within a day only, no moving a stop to a different day.
- Destination photos come from a Wikipedia title lookup, not a proper image
  search obscure or ambiguous destination names may not resolve to a
  photo and fall back to a plain gradient. The "is this actually a photo"
  check is a heuristic (rejects SVG-sourced images, which Wikipedia uses
  for locator maps/diagrams) and could in theory misfire on an unusual page.
- No customer/venue ratings, every free source either requires an API key
  and account (Google Places, Foursquare) or doesn't exist, so this was
  scoped out rather than shipped as fake data.
- The auto-adjust on adding a custom stop only shifts stops whose existing
  time is in a parseable "9:00 AM" / "14:30" shape; a stop with a vaguer
  time (e.g. "Morning") is left as-is rather than guessed at.
- Reordering and inserting stops are disabled while a category filter is
  active, to avoid ambiguous stop positions, clearing the filter re-enables
  both.
- Primarily tested in Chrome/Safari on macOS; not tested against older
  browsers.

## Deployment

Deployed on [Vercel](https://vercel.com) as a single project (`vercel.json`
at the repo root): the frontend builds to static files, and `api/plan-trip.ts`
runs as a serverless function on the same domain — so there's no
cross-origin config needed in production, unlike a two-service split.

The serverless function doesn't duplicate the Express route's logic: both it
and `server/src/routes/plan.ts` (used for local dev) call the same
framework-agnostic `handlePlanTrip()` in `server/src/planTrip.ts`. Locally,
that runs inside the actual Express server; in production, Vercel's Node
runtime calls it directly. Same validation, same error handling, same
reliability guarantees either way — just a thinner adapter in production.

`GEMINI_API_KEY` is set as a Vercel environment variable, never committed.

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

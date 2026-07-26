# Trip Planner

Describe a trip in plain language, get back a day-by-day itinerary you can
expand, tweak, and reorder — not a chat transcript.

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

## AI-usage note

_(fill in honestly once the build is further along — which parts were
scaffolded/assisted vs. hand-written, what tools were used for what)_

## Known limitations

_(fill in as they're discovered)_

## Time spent

_(fill in at the end)_

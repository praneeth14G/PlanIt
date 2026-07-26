import { useState } from "react";
import { useTripPlanner } from "./hooks/useTripPlanner";
import { TripForm } from "./components/TripForm";
import { StatusBanner } from "./components/StatusBanner";
import { ItineraryView } from "./components/ItineraryView";
import { RefineBar } from "./components/RefineBar";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const { state, submit, retry, edit } = useTripPlanner();
  const isLoading = state.status === "loading";
  const itinerary = "itinerary" in state ? state.itinerary : undefined;

  return (
    <main className="app">
      <header className="app-header">
        <svg className="app-logo" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
          <path d="M15 9l-2 5-5 2 2-5z" fill="currentColor" />
        </svg>
        <h1>PlanIt</h1>
      </header>
      <p className="tagline">Describe a trip in your own words, get a day-by-day plan you can rearrange.</p>

      <TripForm value={prompt} onValueChange={setPrompt} isLoading={isLoading} onSubmit={submit} />

      <StatusBanner
        status={state.status}
        message={state.status === "error" ? state.message : undefined}
        onRetry={state.status === "error" ? retry : undefined}
      />

      {itinerary && (
        <>
          <ItineraryView itinerary={itinerary} onChange={edit} />
          <RefineBar isLoading={isLoading} onSubmit={(instruction) => submit(instruction, itinerary)} />
        </>
      )}
    </main>
  );
}

export default App;

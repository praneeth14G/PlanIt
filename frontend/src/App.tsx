import { useState } from "react";
import { useTripPlanner } from "./hooks/useTripPlanner";
import { TripForm } from "./components/TripForm";
import { StatusBanner } from "./components/StatusBanner";
import { ItineraryView } from "./components/ItineraryView";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const { state, submit, edit } = useTripPlanner();
  const isLoading = state.status === "loading";

  return (
    <main className="app">
      <h1>Trip Planner</h1>
      <p className="tagline">Describe a trip in your own words, get a day-by-day plan you can rearrange.</p>

      <TripForm value={prompt} onValueChange={setPrompt} isLoading={isLoading} onSubmit={submit} />

      <StatusBanner
        status={state.status}
        message={state.status === "error" ? state.message : undefined}
        onRetry={state.status === "error" ? () => submit(prompt) : undefined}
      />

      {"itinerary" in state && state.itinerary && <ItineraryView itinerary={state.itinerary} onChange={edit} />}
    </main>
  );
}

export default App;

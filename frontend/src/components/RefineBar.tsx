import { useState, type FormEvent } from "react";

interface Props {
  isLoading: boolean;
  onSubmit: (instruction: string) => void;
}

export function RefineBar({ isLoading, onSubmit }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <form className="refine-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tweak it, e.g. “swap day 2's museum for something outdoors”"
        aria-label="Follow-up instruction to refine the itinerary"
      />
      <button type="submit" disabled={!value.trim()}>
        {isLoading ? "Updating…" : "Update"}
      </button>
    </form>
  );
}

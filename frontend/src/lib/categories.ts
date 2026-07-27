export interface InterestCategory {
  label: string;
  emoji: string;
}

// Feeds two things: the interest chips on the trip form (biases what Gemini
// includes) and the category datalist on the "add a stop" form. Not an enum
// enforced anywhere - stop categories in a returned itinerary are whatever
// free-text label the model picked, these are just common suggestions.
export const INTEREST_CATEGORIES: InterestCategory[] = [
  { label: "Food & Drink", emoji: "🍜" },
  { label: "Sightseeing", emoji: "🏛️" },
  { label: "Devotional", emoji: "🙏" },
  { label: "Nature & Outdoors", emoji: "🌳" },
  { label: "Adventure Sports", emoji: "🧗" },
  { label: "Sports", emoji: "🏅" },
  { label: "Shopping", emoji: "🛍️" },
  { label: "Nightlife", emoji: "🌙" },
];

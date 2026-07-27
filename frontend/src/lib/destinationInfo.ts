export interface DestinationInfo {
  imageUrl: string | null;
  description: string | null;
}

const EMPTY: DestinationInfo = { imageUrl: null, description: null };

// Wikipedia's page-summary REST API: no API key, CORS-enabled, and it
// hands back both a Wikimedia Commons photo (openly licensed, free to
// hotlink) and a short plain-text description in one call - exactly what
// the destination hero/about section needs, with no backend round trip.
const cache = new Map<string, DestinationInfo>();

export async function fetchDestinationInfo(destination: string, signal?: AbortSignal): Promise<DestinationInfo> {
  const trimmed = destination.trim();
  if (!trimmed) return EMPTY;

  const key = trimmed.toLowerCase();
  if (cache.has(key)) return cache.get(key) ?? EMPTY;

  // A destination like "Lisbon, Portugal" often isn't a Wikipedia title -
  // fall back to just the first segment before giving up.
  const candidates = [...new Set([trimmed, trimmed.split(",")[0].trim()])].filter(Boolean);

  for (const candidate of candidates) {
    const info = await lookupSummary(candidate, signal);
    if (info) {
      cache.set(key, info);
      return info;
    }
  }

  cache.set(key, EMPTY);
  return EMPTY;
}

async function lookupSummary(title: string, signal?: AbortSignal): Promise<DestinationInfo | null> {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
      signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Wikipedia's lead image is sometimes a locator map/diagram rather than
    // a photo (e.g. "Bali" -> a location-marker SVG) - real Commons photos
    // are essentially never SVG, so that's a reliable way to skip them.
    // Thumbnails render SVGs to PNG, so the delivered URL ends in
    // ".svg.png" rather than ".svg" - check for the substring, not the
    // suffix.
    const rawImageUrl: string | null = data?.originalimage?.source ?? data?.thumbnail?.source ?? null;
    const imageUrl = rawImageUrl && !rawImageUrl.toLowerCase().includes(".svg") ? rawImageUrl : null;
    const description: string | null =
      typeof data?.extract === "string" && data.extract.trim() ? data.extract.trim() : null;
    if (!imageUrl && !description) return null;
    return { imageUrl, description };
  } catch {
    return null;
  }
}

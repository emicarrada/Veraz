const READ_KEY = "veraz.feed.readSlugs";
const SEEN_KEY = "veraz.feed.lastSeenAt";
const MAX_READ = 400;

/** Previous visit captured for this page load. Survives React strict-mode remounts. */
let visitAnchor: string | null | undefined;

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function readStoredSlugs(): string[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(READ_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export function rememberReadSlug(slug: string): void {
  if (!canUseStorage()) return;

  const current = readStoredSlugs();
  if (current.includes(slug)) return;

  window.localStorage.setItem(READ_KEY, JSON.stringify([...current, slug].slice(-MAX_READ)));
  window.dispatchEvent(new Event("veraz-feed-read"));
}

export function readLastSeenAt(): string | null {
  if (!canUseStorage()) return null;
  const value = window.localStorage.getItem(SEEN_KEY);
  if (!value || !Number.isFinite(Date.parse(value))) return null;
  return value;
}

export function markFeedSeen(now = new Date().toISOString()): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SEEN_KEY, now);
}

/**
 * Time of the previous visit, stable for the rest of this page load.
 * The stored timestamp moves forward so the next full load can compare again.
 */
export function beginFeedVisit(): string | null {
  if (visitAnchor !== undefined) return visitAnchor;
  visitAnchor = readLastSeenAt();
  markFeedSeen();
  return visitAnchor;
}

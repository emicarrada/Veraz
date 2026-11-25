const STEPS: ReadonlyArray<{ limit: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { limit: 60, unit: "second" },
  { limit: 60, unit: "minute" },
  { limit: 24, unit: "hour" },
  { limit: 7, unit: "day" },
  { limit: 4.34524, unit: "week" },
  { limit: 12, unit: "month" },
  { limit: Number.POSITIVE_INFINITY, unit: "year" },
];

/** Locale-aware relative time. `now` is injectable so tests stay stable. */
export function formatRelativeTime(iso: string, locale: string, now = Date.now()): string {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return iso;

  let deltaSeconds = (time - now) / 1000;
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(deltaSeconds) < 45) {
    return formatter.format(0, "second");
  }

  for (const step of STEPS) {
    if (Math.abs(deltaSeconds) < step.limit) {
      return formatter.format(Math.round(deltaSeconds), step.unit);
    }
    deltaSeconds /= step.limit;
  }

  return formatter.format(Math.round(deltaSeconds), "year");
}

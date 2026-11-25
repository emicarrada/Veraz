/** Public feed day boundary. Mexico City has no daylight saving time. */
export const FEED_TIME_ZONE = "America/Mexico_City";

/**
 * Start of the current calendar day in the feed timezone, as an absolute instant.
 */
export function startOfFeedDay(now = new Date(), timeZone = FEED_TIME_ZONE): Date {
  const truncated = new Date(Math.floor(now.getTime() / 1000) * 1000);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(truncated);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  const year = value("year");
  const month = value("month");
  const day = value("day");
  const hour = value("hour");
  const minute = value("minute");
  const second = value("second");

  const zonedAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const offsetMs = zonedAsUtc - truncated.getTime();
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - offsetMs);
}

/** Start of the previous calendar day in the feed timezone. Mexico City does not observe DST. */
export function startOfPreviousFeedDay(now = new Date(), timeZone = FEED_TIME_ZONE): Date {
  return new Date(startOfFeedDay(now, timeZone).getTime() - 24 * 60 * 60 * 1000);
}

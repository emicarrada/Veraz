import { FEED_TIME_ZONE } from "@/features/news/utils/feed-day";

function calendarKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Calendar day in the feed timezone: today, yesterday, or a date like "24 de noviembre". */
export function formatFeedDayLabel(
  iso: string,
  locale: string,
  labels: { today: string; yesterday: string },
  now = new Date(),
  timeZone = FEED_TIME_ZONE,
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const day = calendarKey(date, timeZone);
  const today = calendarKey(now, timeZone);
  if (day === today) return labels.today;

  const yesterday = calendarKey(new Date(now.getTime() - 24 * 60 * 60 * 1000), timeZone);
  if (day === yesterday) return labels.yesterday;

  return new Intl.DateTimeFormat(locale, {
    timeZone,
    day: "numeric",
    month: "long",
  }).format(date);
}

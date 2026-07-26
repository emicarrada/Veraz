/** Start of calendar day in `timeZone`, as ISO UTC for Supabase filters. */
export function startOfTodayUtcIso(timeZone: string): string {
  const now = new Date();
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const [yStr, mStr, dStr] = ymd.split("-");
  const y = Number.parseInt(yStr ?? "1970", 10);
  const m = Number.parseInt(mStr ?? "1", 10);
  const d = Number.parseInt(dStr ?? "1", 10);

  const probe = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const offsetLabel =
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    })
      .formatToParts(probe)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT";

  let offsetMinutes = 0;
  const match = offsetLabel.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (match) {
    offsetMinutes = Number.parseInt(match[2]!, 10) * 60 + Number.parseInt(match[3] ?? "0", 10);
    if (match[1] === "-") offsetMinutes = -offsetMinutes;
  }

  const utcStartMs = Date.UTC(y, m - 1, d, 0, 0, 0) - offsetMinutes * 60_000;
  return new Date(utcStartMs).toISOString();
}

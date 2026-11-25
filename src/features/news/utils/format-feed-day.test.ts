import { describe, expect, it } from "vitest";

import { formatFeedDayLabel } from "@/features/news/utils/format-feed-day";

const labels = { today: "Hoy", yesterday: "Ayer" };
const now = new Date("2026-11-25T18:00:00.000Z");

describe("formatFeedDayLabel", () => {
  it("names today and yesterday in Mexico City", () => {
    expect(formatFeedDayLabel("2026-11-25T16:00:00.000Z", "es", labels, now)).toBe("Hoy");
    expect(formatFeedDayLabel("2026-11-24T16:00:00.000Z", "es", labels, now)).toBe("Ayer");
  });

  it("writes an older date in the page language", () => {
    expect(formatFeedDayLabel("2026-11-23T16:00:00.000Z", "es", labels, now)).toBe("23 de noviembre");
    expect(formatFeedDayLabel("2026-11-23T16:00:00.000Z", "en", { today: "Today", yesterday: "Yesterday" }, now)).toBe(
      "November 23",
    );
  });
});

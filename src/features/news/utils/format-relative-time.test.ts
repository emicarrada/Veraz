import { describe, expect, it } from "vitest";

import { formatRelativeTime } from "@/features/news/utils/format-relative-time";

const now = Date.parse("2026-07-18T12:00:00.000Z");

describe("formatRelativeTime", () => {
  it("formats minutes in Spanish", () => {
    const label = formatRelativeTime("2026-07-18T11:42:00.000Z", "es", now);
    expect(label).toMatch(/18/);
    expect(label.toLowerCase()).toMatch(/minuto/);
  });

  it("formats hours in English", () => {
    const label = formatRelativeTime("2026-07-18T09:00:00.000Z", "en", now);
    expect(label.toLowerCase()).toMatch(/hour/);
  });

  it("returns the original string when the date is invalid", () => {
    expect(formatRelativeTime("not-a-date", "es", now)).toBe("not-a-date");
  });
});

import { describe, expect, it } from "vitest";

import { startOfFeedDay } from "@/features/news/utils/feed-day";

describe("startOfFeedDay", () => {
  it("uses the Mexico City calendar day before midnight there", () => {
    const start = startOfFeedDay(new Date("2026-11-24T05:30:00.000Z"));
    expect(start.toISOString()).toBe("2026-11-23T06:00:00.000Z");
  });

  it("uses the Mexico City calendar day after midnight there", () => {
    const start = startOfFeedDay(new Date("2026-11-24T15:00:00.000Z"));
    expect(start.toISOString()).toBe("2026-11-24T06:00:00.000Z");
  });
});

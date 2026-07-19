import { describe, expect, it } from "vitest";

import { formatDisplayText, formatFeedSummary } from "@/features/news/utils/format-display-text";

describe("formatDisplayText", () => {
  it("decodes legacy HTML entities in stored excerpts", () => {
    expect(
      formatDisplayText(
        "La Fiscal&#237;a de Bolivia inform&#243; este s&#225;bado",
      ),
    ).toBe("La Fiscalía de Bolivia informó este sábado");
  });
});

describe("formatFeedSummary", () => {
  it("returns a short preview with ellipsis when needed", () => {
    const long = `${"palabra ".repeat(40)}`.trim();
    const result = formatFeedSummary(long);
    expect(result.length).toBeLessThanOrEqual(181);
    expect(result.endsWith("…")).toBe(true);
  });
});

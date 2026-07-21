import { describe, expect, it } from "vitest";

import { dedupeLocalePrefix } from "@/i18n/dedupe-locale-prefix";

describe("dedupeLocalePrefix", () => {
  it("collapses duplicated locale segments", () => {
    expect(dedupeLocalePrefix("/en/en/noticias")).toBe("/en/noticias");
    expect(dedupeLocalePrefix("/es/es")).toBe("/es");
    expect(dedupeLocalePrefix("/en/en")).toBe("/en");
  });

  it("returns null for valid single-locale paths", () => {
    expect(dedupeLocalePrefix("/en/noticias")).toBeNull();
    expect(dedupeLocalePrefix("/es")).toBeNull();
    expect(dedupeLocalePrefix("/noticias")).toBeNull();
  });
});

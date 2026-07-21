import { describe, expect, it } from "vitest";

import {
  EN_FEED_SOURCE_SLUGS,
  PRESTIGIOUS_FINANCE_SOURCES_EN,
  PRESTIGIOUS_FINANCE_SOURCES_ES,
  PRESTIGIOUS_TECH_SOURCES_EN,
  resolveFeedLanguageCodes,
  resolveFeedSourceSlugs,
  resolvePrestigiousFeedQuery,
} from "@/features/news/config/prestigious-sources";

describe("prestigious sources by locale", () => {
  it("uses EN-only finance sources for /en economia tab", () => {
    expect(resolvePrestigiousFeedQuery("economia", "en")).toEqual({
      sourceSlugs: PRESTIGIOUS_FINANCE_SOURCES_EN.map((source) => source.slug),
    });
  });

  it("uses mixed finance sources for /es economia tab", () => {
    const slugs = resolvePrestigiousFeedQuery("economia", "es").sourceSlugs ?? [];
    expect(slugs).toContain("cnbc-top");
    expect(slugs).toContain("expansion");
  });

  it("uses EN-only tech sources for /en tecnologia tab", () => {
    expect(resolvePrestigiousFeedQuery("tecnologia", "en")).toEqual({
      sourceSlugs: PRESTIGIOUS_TECH_SOURCES_EN.map((source) => source.slug),
    });
  });

  it("excludes ES-only sources from EN prestigious lists", () => {
    const enFinance = resolvePrestigiousFeedQuery("economia", "en").sourceSlugs ?? [];
    for (const source of PRESTIGIOUS_FINANCE_SOURCES_ES) {
      expect(enFinance).not.toContain(source.slug);
    }
  });

  it("filters /en feed to English language codes only", () => {
    expect(resolveFeedLanguageCodes("en")).toEqual(["en"]);
    expect(resolveFeedLanguageCodes("es")).toBeUndefined();
  });

  it("whitelists EN catalog sources for /en feed (excludes Clarín, Infobae, etc.)", () => {
    const allowed = resolveFeedSourceSlugs("en") ?? [];
    expect(allowed).toEqual(EN_FEED_SOURCE_SLUGS);
    expect(allowed).toContain("cnbc-top");
    expect(allowed).toContain("techcrunch");
    expect(allowed).toContain("bbc-sport");
    expect(allowed).toContain("variety");
    expect(allowed).not.toContain("infobae");
    expect(allowed).not.toContain("la-nacion");
    expect(allowed).not.toContain("clarin");
    expect(resolveFeedSourceSlugs("es")).toBeUndefined();
  });

  it("uses prestigious source slugs when tab applies", () => {
    const prestigious = resolvePrestigiousFeedQuery("economia", "en").sourceSlugs;
    expect(resolveFeedSourceSlugs("en", prestigious)).toEqual(prestigious);
  });
});

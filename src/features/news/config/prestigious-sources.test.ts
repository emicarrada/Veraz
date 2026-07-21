import { describe, expect, it } from "vitest";

import {
  PRESTIGIOUS_FINANCE_SOURCES,
  PRESTIGIOUS_TECH_SOURCES,
  getPrestigiousSourceSlugsForCategory,
  getPrestigiousFeedTrustIntro,
  resolvePrestigiousFeedQuery,
} from "@/features/news/config/prestigious-sources";

describe("prestigious sources", () => {
  it("excludes general tabloids from finance slugs", () => {
    const slugs = getPrestigiousSourceSlugsForCategory("economia") ?? [];
    expect(slugs).not.toContain("infobae");
    expect(slugs).not.toContain("la-nacion");
    expect(slugs).toEqual(PRESTIGIOUS_FINANCE_SOURCES.map((source) => source.slug));
  });

  it("excludes blogs from tech slugs", () => {
    const slugs = getPrestigiousSourceSlugsForCategory("tecnologia") ?? [];
    expect(slugs).not.toContain("xataka");
    expect(slugs).not.toContain("infobae");
    expect(slugs).toEqual(PRESTIGIOUS_TECH_SOURCES.map((source) => source.slug));
  });

  it("applies prestigious filter to finance subtopics", () => {
    expect(resolvePrestigiousFeedQuery("mercados")).toEqual({
      categorySlug: "mercados",
      sourceSlugs: PRESTIGIOUS_FINANCE_SOURCES.map((source) => source.slug),
    });
    expect(resolvePrestigiousFeedQuery("criptomonedas")).toEqual({
      categorySlug: "criptomonedas",
      sourceSlugs: PRESTIGIOUS_FINANCE_SOURCES.map((source) => source.slug),
    });
  });

  it("uses source-only filter for broad finanzas and tecnologia tabs on /es", () => {
    expect(resolvePrestigiousFeedQuery("economia", "es")).toEqual({
      sourceSlugs: PRESTIGIOUS_FINANCE_SOURCES.map((source) => source.slug),
    });
    expect(resolvePrestigiousFeedQuery("tecnologia", "es")).toEqual({
      sourceSlugs: PRESTIGIOUS_TECH_SOURCES.map((source) => source.slug),
    });
  });

  it("uses EN-only sources for broad finanzas and tecnologia tabs on /en", () => {
    const enFinance = resolvePrestigiousFeedQuery("economia", "en").sourceSlugs ?? [];
    expect(enFinance).toContain("cnbc-top");
    expect(enFinance).not.toContain("expansion");

    const enTech = resolvePrestigiousFeedQuery("tecnologia", "en").sourceSlugs ?? [];
    expect(enTech).toContain("techcrunch");
    expect(enTech).not.toContain("el-pais-tecnologia");
  });

  it("does not filter general categories", () => {
    expect(getPrestigiousSourceSlugsForCategory("politica")).toBeUndefined();
    expect(getPrestigiousSourceSlugsForCategory(undefined)).toBeUndefined();
  });

  it("includes source labels in trust intro", () => {
    expect(getPrestigiousFeedTrustIntro("economia")).toContain("CNBC");
    expect(getPrestigiousFeedTrustIntro("tecnologia")).toContain("TechCrunch");
    expect(getPrestigiousFeedTrustIntro("economia")).toContain("fuente original");
  });
});

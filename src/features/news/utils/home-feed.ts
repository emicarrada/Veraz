import {
  cultureSourceSlugsForCountry,
  sourceSlugsForCountry,
} from "@/config/domains/rss-feed-catalog";

/** Anonymous Mexico home opens with these outlets, then the rest of the country. */
export const MEXICO_FRONT_SOURCE_SLUGS = ["chilango", "sopitas", "xataka-mx"] as const;

export function homeFeedSlugs(
  countryCode: string,
  visibleSourceSlugs?: readonly string[],
): { home: readonly string[]; lead: readonly string[]; leadExclusive: boolean } {
  const code = countryCode.trim().toUpperCase();
  const visible = visibleSourceSlugs ? new Set(visibleSourceSlugs) : null;
  const home = sourceSlugsForCountry(code).filter((slug) => !visible || visible.has(slug));
  if (code === "MX") {
    const lead = MEXICO_FRONT_SOURCE_SLUGS.filter((slug) => home.includes(slug));
    return { home, lead, leadExclusive: true };
  }
  const lead = cultureSourceSlugsForCountry(code).filter((slug) => home.includes(slug));
  return { home, lead, leadExclusive: false };
}

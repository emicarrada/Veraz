import {
  cultureSourceSlugsForCountry,
  sourceSlugsForCountry,
} from "@/config/domains/rss-feed-catalog";

export function homeFeedSlugs(
  countryCode: string,
  visibleSourceSlugs?: readonly string[],
): { home: readonly string[]; lead: readonly string[] } {
  const visible = visibleSourceSlugs ? new Set(visibleSourceSlugs) : null;
  const home = sourceSlugsForCountry(countryCode).filter((slug) => !visible || visible.has(slug));
  const lead = cultureSourceSlugsForCountry(countryCode).filter((slug) => home.includes(slug));
  return { home, lead };
}

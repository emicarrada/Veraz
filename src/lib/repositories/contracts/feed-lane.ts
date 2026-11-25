export type FeedLane = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * 0 = home culture with the outlet's own sharp photo
 * 1 = the rest of that country, with its own sharp photo
 * 2 = home culture without a usable photo
 * 3 = the rest of that country, without a usable photo
 * 4 = everywhere else with a sharp photo
 * 5 = everywhere else without one
 */
export function resolveFeedLane(
  sourceSlug: string,
  categorySlug: string,
  homeSlugs: readonly string[],
  leadSlugs: readonly string[],
  hasOwnImage: boolean,
): FeedLane {
  const home = homeSlugs.includes(sourceSlug);
  const culture = categorySlug === "cultura" || leadSlugs.includes(sourceSlug);
  if (home && culture && hasOwnImage) return 0;
  if (home && hasOwnImage) return 1;
  if (home && culture) return 2;
  if (home) return 3;
  if (hasOwnImage) return 4;
  return 5;
}

export type FeedLane = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Default:
 * 0 = home culture with the outlet's own sharp photo
 * 1 = the rest of that country, with its own sharp photo
 * 2 = home culture without a usable photo
 * 3 = the rest of that country, without a usable photo
 * 4 = everywhere else with a sharp photo
 * 5 = everywhere else without one
 *
 * leadExclusive (anonymous Mexico): the named outlets occupy 0 and 1,
 * then the rest of that country, then everywhere else. Cultura does not jump ahead.
 */
export function resolveFeedLane(
  sourceSlug: string,
  categorySlug: string,
  homeSlugs: readonly string[],
  leadSlugs: readonly string[],
  hasOwnImage: boolean,
  leadExclusive = false,
): FeedLane {
  const home = homeSlugs.includes(sourceSlug);
  const lead = leadSlugs.includes(sourceSlug);
  if (leadExclusive) {
    if (lead && hasOwnImage) return 0;
    if (lead) return 1;
    if (home && hasOwnImage) return 2;
    if (home) return 3;
    if (hasOwnImage) return 4;
    return 5;
  }
  const culture = categorySlug === "cultura" || lead;
  if (home && culture && hasOwnImage) return 0;
  if (home && hasOwnImage) return 1;
  if (home && culture) return 2;
  if (home) return 3;
  if (hasOwnImage) return 4;
  return 5;
}

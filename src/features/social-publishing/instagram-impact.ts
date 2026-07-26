import type { NewsCategorySlug } from "@/features/news/classification/categories";
import type { SocialArticleCandidate } from "@/features/social-publishing/types";

const VISUAL_OR_HIGH_REACH_CATEGORIES = new Set<NewsCategorySlug>([
  "deportes",
  "futbol",
  "nba",
  "messi",
  "ronaldo",
  "rugby",
  "cultura",
  "internacional",
  "sociedad",
]);

/** Higher = better fit for Instagram feed (real photo + visual topic). */
export function instagramImpactScore(candidate: SocialArticleCandidate): number {
  let score = 0;
  if (candidate.heroImageUrl?.trim()) score += 2;
  if (VISUAL_OR_HIGH_REACH_CATEGORIES.has(candidate.categorySlug)) score += 1;
  if (candidate.excerpt.trim().length >= 80) score += 1;
  return score;
}

export function meetsInstagramImpactThreshold(
  candidate: SocialArticleCandidate,
  minScore: number,
): boolean {
  return instagramImpactScore(candidate) >= minScore;
}

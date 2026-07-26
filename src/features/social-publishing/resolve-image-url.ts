import type { SocialArticleCandidate } from "@/features/social-publishing/types";

/** Hero from RSS, else category fallback on Veraz. */
export function resolveSocialImageUrl(candidate: SocialArticleCandidate): string {
  if (candidate.heroImageUrl?.trim()) {
    return candidate.heroImageUrl.trim();
  }
  return candidate.categoryFallbackImageUrl;
}

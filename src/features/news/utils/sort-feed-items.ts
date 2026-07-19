import type { ArticleFeedItem } from "@/features/news/types/feed";

/** Newest publication time first; stable tie-breaker by article id. */
export function compareFeedItemsByPublishedAt(
  a: Pick<ArticleFeedItem, "publishedAt" | "id">,
  b: Pick<ArticleFeedItem, "publishedAt" | "id">,
): number {
  const byPublished = b.publishedAt.localeCompare(a.publishedAt);
  if (byPublished !== 0) return byPublished;
  return b.id.localeCompare(a.id);
}

export function sortFeedItemsByPublishedAt(
  items: ReadonlyArray<ArticleFeedItem>,
): ArticleFeedItem[] {
  return [...items].sort(compareFeedItemsByPublishedAt);
}

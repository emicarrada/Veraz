import { describe, expect, it } from "vitest";

import type { ArticleId } from "@/domain/shared/ids";
import {
  compareFeedItemsByPublishedAt,
  sortFeedItemsByPublishedAt,
} from "@/features/news/utils/sort-feed-items";
import type { ArticleFeedItem } from "@/features/news/types/feed";

function item(publishedAt: string, id: string): ArticleFeedItem {
  return {
    id: id as ArticleId,
    slug: id,
    title: id,
    excerpt: "",
    summary: "",
    categorySlug: "general",
    categoryLabel: "General",
    categoryFallbackImageUrl: "/ImagenesNoticias/general.webp",
    publishedAt,
    canonicalUrl: "https://example.com",
    sourceName: "Demo",
    sourceSlug: "demo",
    sourceAttributionName: "Demo",
  };
}

describe("sortFeedItemsByPublishedAt", () => {
  it("orders newest publication first", () => {
    const sorted = sortFeedItemsByPublishedAt([
      item("2026-07-16T10:00:00.000Z", "a"),
      item("2026-07-18T08:00:00.000Z", "b"),
      item("2026-07-17T12:00:00.000Z", "c"),
    ]);

    expect(sorted.map((entry) => entry.id)).toEqual(["b", "c", "a"]);
  });

  it("uses id as tie-breaker for same publishedAt", () => {
    expect(
      compareFeedItemsByPublishedAt(
        item("2026-07-16T10:00:00.000Z", "a"),
        item("2026-07-16T10:00:00.000Z", "b"),
      ),
    ).toBeGreaterThan(0);
  });
});

import { describe, expect, it } from "vitest";

import type { NormalizedArticle } from "@/lib/news-ingestion/types/article";
import {
  NormalizedArticleMapper,
  buildArticleSlug,
} from "@/lib/news-ingestion/mappers/normalized-article-mapper";

const BASE_NORMALIZED: NormalizedArticle = {
  providerId: "rss",
  providerItemId: "item-1",
  sourceSlug: "demo-source",
  canonicalUrl: "https://example.com/news/first",
  urlFingerprint: "abc1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
  title: "First Article Title",
  excerpt: "Short excerpt",
  publishedAt: "2026-07-16T12:00:00.000Z",
  languageCode: "en",
  contentFormat: "text",
  paywallOriginal: false,
  references: [
    {
      url: "https://example.com/news/first",
      title: "First Article Title",
      kind: "original",
    },
  ],
};

describe("buildArticleSlug", () => {
  it("slugifies title and appends fingerprint suffix", () => {
    expect(
      buildArticleSlug(
        "First Article Title",
        "abc1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      ),
    ).toBe("first-article-title-abc12345");
  });
});

describe("NormalizedArticleMapper", () => {
  const mapper = new NormalizedArticleMapper();
  const now = "2026-07-17T00:00:00.000Z";

  it("maps NormalizedArticle to domain-shaped bundle without I/O", () => {
    const result = mapper.map(
      {
        ...BASE_NORMALIZED,
        bodyExcerpt: "Longer body",
        byline: "Jane Doe",
        heroImageUrl: "https://example.com/image.jpg",
        contentFormat: "mixed",
      },
      now,
    );

    expect(result.sourceSlug).toBe("demo-source");
    expect(result.languageCode).toBe("en");
    expect(result.article.title).toBe("First Article Title");
    expect(result.article.canonicalUrl).toBe("https://example.com/news/first");
    expect(result.article.urlFingerprint).toBe(BASE_NORMALIZED.urlFingerprint);
    expect(result.article.status).toBe("ingested");
    expect(result.article.ingestedAt).toBe(now);
    expect(result.article.updatedAt).toBe(now);
    expect(result.article.bodyExcerpt).toBe("Longer body");
    expect(result.article.byline).toBe("Jane Doe");
    expect(result.heroMedia).toEqual({
      kind: "image",
      url: "https://example.com/image.jpg",
      altText: "First Article Title",
    });
    expect(result.references).toHaveLength(1);
    expect(result.references[0]?.kind).toBe("original");
  });

  it("defaults references to canonical original when missing", () => {
    const result = mapper.map(
      {
        ...BASE_NORMALIZED,
        references: undefined,
        heroImageUrl: undefined,
      },
      now,
    );

    expect(result.heroMedia).toBeUndefined();
    expect(result.references).toEqual([
      {
        url: BASE_NORMALIZED.canonicalUrl,
        title: BASE_NORMALIZED.title,
        kind: "original",
      },
    ]);
    expect(result.article.slug).toContain("first-article-title");
  });
});

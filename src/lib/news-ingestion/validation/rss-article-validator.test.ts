import { describe, expect, it } from "vitest";

import { validateNormalizedArticle } from "@/lib/news-ingestion/validation/rss-article-validator";
import type { NormalizedArticle } from "@/lib/news-ingestion/types/article";

function baseArticle(overrides: Partial<NormalizedArticle> = {}): NormalizedArticle {
  return {
    providerId: "rss",
    providerItemId: "item-1",
    sourceSlug: "test-source",
    canonicalUrl: "https://example.com/article",
    urlFingerprint: "abc123",
    title: "Test title",
    excerpt: "Test excerpt",
    publishedAt: "2026-01-01T00:00:00.000Z",
    languageCode: "es",
    contentFormat: "text",
    paywallOriginal: false,
    ...overrides,
  };
}

describe("validateNormalizedArticle", () => {
  it("accepts a valid article", () => {
    const result = validateNormalizedArticle(baseArticle());
    expect(result.outcome).toBe("accepted");
  });

  it("rejects private canonical URLs", () => {
    const result = validateNormalizedArticle(
      baseArticle({ canonicalUrl: "http://127.0.0.1/internal" }),
    );
    expect(result.outcome).toBe("rejected");
    if (result.outcome === "rejected") {
      expect(result.rejection.code).toBe("policy");
    }
  });

  it("rejects live blog URLs via policy", () => {
    const result = validateNormalizedArticle(
      baseArticle({
        canonicalUrl: "https://www.bbc.com/mundo/live/123",
      }),
    );
    expect(result.outcome).toBe("rejected");
  });

  it("rejects oversized titles", () => {
    const result = validateNormalizedArticle(
      baseArticle({ title: "x".repeat(501) }),
    );
    expect(result.outcome).toBe("rejected");
  });
});

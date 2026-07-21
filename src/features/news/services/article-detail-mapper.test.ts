import { describe, expect, it } from "vitest";

import type { ArticleId, SourceId } from "@/domain/shared/ids";
import { mapArticleDetailRecord } from "@/features/news/services/article-detail-mapper";
import type { ArticleDetailRecord } from "@/lib/repositories/contracts/article-repository";

const record: ArticleDetailRecord = {
  article: {
    id: "article-1" as ArticleId,
    sourceId: "source-1" as SourceId,
    slug: "demo-post-abc12345",
    canonicalUrl: "https://example.com/post",
    urlFingerprint: "fp-1",
    title: "Demo Post",
    excerpt: "Lead paragraph",
    bodyExcerpt: "Extended body text.",
    contentFormat: "mixed",
    languageId: "lang-en" as import("@/domain/shared/ids").LanguageId,
    publishedAt: "2026-07-16T12:00:00.000Z",
    ingestedAt: "2026-07-17T00:00:00.000Z",
    updatedAt: "2026-07-17T00:00:00.000Z",
    status: "ingested",
    paywallOriginal: false,
    byline: "Jane Doe",
  },
  categorySlug: "general",
  languageCode: "en",
  source: {
    id: "source-1" as SourceId,
    slug: "demo",
    name: "Demo Source",
    attributionName: "Demo Source",
    homepageUrl: "https://example.com",
  },
  heroMedia: {
    id: "media-1" as import("@/domain/shared/ids").MediaId,
    kind: "image",
    url: "https://example.com/image.jpg",
    altText: "Demo image",
  },
  references: [
    {
      id: "ref-1" as import("@/domain/shared/ids").ReferenceId,
      articleId: "article-1" as ArticleId,
      url: "https://example.com/post",
      title: "Original",
      kind: "original",
    },
  ],
};

describe("mapArticleDetailRecord", () => {
  it("maps repository record to article detail item", () => {
    const item = mapArticleDetailRecord(record);

    expect(item.slug).toBe("demo-post-abc12345");
    expect(item.title).toBe("Demo Post");
    expect(item.bodyExcerpt).toBe("Extended body text.");
    expect(item.byline).toBe("Jane Doe");
    expect(item.heroImage?.url).toBe("https://example.com/image.jpg");
    expect(item.categoryLabel).toBeTruthy();
    expect(item.categoryFallbackImageUrl).toContain("/ImagenesNoticias/");
    expect(item.references).toHaveLength(1);
    expect(item.source.attributionName).toBe("Demo Source");
  });
});

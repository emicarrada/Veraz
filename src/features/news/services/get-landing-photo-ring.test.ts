import { describe, expect, it, vi } from "vitest";

import type { ArticleId, LanguageId, SourceId } from "@/domain/shared/ids";
import { getLandingPhotoRing, selectLandingPhotoRing } from "@/features/news/services/get-landing-photo-ring";
import { startOfPreviousFeedDay } from "@/features/news/utils/feed-day";
import type { ArticleFeedRecord, ArticleRepository } from "@/lib/repositories/contracts/article-repository";

const now = new Date("2026-11-25T18:00:00.000Z");

function record(partial: {
  slug: string;
  title: string;
  sourceSlug: string;
  publishedAt: string;
  image?: string;
}): ArticleFeedRecord {
  return {
    article: {
      id: partial.slug as ArticleId,
      sourceId: "source-1" as SourceId,
      slug: partial.slug,
      canonicalUrl: `https://example.com/${partial.slug}`,
      urlFingerprint: partial.slug,
      title: partial.title,
      excerpt: "Excerpt",
      contentFormat: "text",
      languageId: "lang" as LanguageId,
      publishedAt: partial.publishedAt,
      ingestedAt: partial.publishedAt,
      updatedAt: partial.publishedAt,
      status: "ingested",
      paywallOriginal: false,
    },
    categorySlug: "cultura",
    languageCode: "es",
    sourceName: partial.sourceSlug,
    sourceSlug: partial.sourceSlug,
    sourceAttributionName: partial.sourceSlug,
    ...(partial.image ? { heroImageUrl: partial.image } : {}),
  };
}

describe("selectLandingPhotoRing", () => {
  it("stays on today when today already has enough photos", () => {
    const today = "2026-11-25T16:00:00.000Z";
    const yesterday = "2026-11-24T16:00:00.000Z";
    const records = [
      ...Array.from({ length: 6 }, (_, index) =>
        record({
          slug: `today-${index}`,
          title: `Hoy ${index}`,
          sourceSlug: `source-${index}`,
          publishedAt: today,
          image: `https://img.example/${index}.jpg`,
        }),
      ),
      record({
        slug: "yesterday",
        title: "Ayer",
        sourceSlug: "old-source",
        publishedAt: yesterday,
        image: "https://img.example/old.jpg",
      }),
    ];

    const items = selectLandingPhotoRing(records, now);

    expect(items.map((item) => item.slug)).not.toContain("yesterday");
    expect(items).toHaveLength(6);
  });

  it("fills with yesterday when today is short, and skips stories without a photo", () => {
    const items = selectLandingPhotoRing(
      [
        record({
          slug: "today",
          title: "Hoy",
          sourceSlug: "chilango",
          publishedAt: "2026-11-25T16:00:00.000Z",
          image: "https://img.example/today.jpg",
        }),
        record({
          slug: "no-photo",
          title: "Sin foto",
          sourceSlug: "reforma",
          publishedAt: "2026-11-25T15:00:00.000Z",
        }),
        record({
          slug: "yesterday",
          title: "Ayer",
          sourceSlug: "xataka-mx",
          publishedAt: "2026-11-24T16:00:00.000Z",
          image: "https://img.example/yesterday.jpg",
        }),
      ],
      now,
    );

    expect(items.map((item) => item.slug)).toEqual(["today", "yesterday"]);
    expect(items[1]?.subtitle).toBe("Xataka México");
  });
});

describe("getLandingPhotoRing", () => {
  it("asks the feed for this locale since yesterday", async () => {
    const listForFeed = vi.fn(async () => ({ items: [], hasMore: false }));
    const repository = { listForFeed } as unknown as ArticleRepository;

    await getLandingPhotoRing("en", repository, now);

    expect(listForFeed).toHaveBeenCalledWith(
      expect.objectContaining({
        chronological: true,
        languageCodes: ["en"],
        publishedSince: startOfPreviousFeedDay(now).toISOString(),
      }),
    );
  });
});

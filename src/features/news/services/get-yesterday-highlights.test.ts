import { describe, expect, it, vi } from "vitest";

import type { ArticleId, LanguageId, SourceId } from "@/domain/shared/ids";
import {
  getYesterdayHighlights,
  selectYesterdayHighlights,
} from "@/features/news/services/get-yesterday-highlights";
import { startOfFeedDay, startOfPreviousFeedDay } from "@/features/news/utils/feed-day";
import type { ArticleFeedRecord, ArticleRepository } from "@/lib/repositories/contracts/article-repository";

const now = new Date("2026-11-25T18:00:00.000Z");

function record(partial: {
  slug: string;
  title: string;
  sourceSlug: string;
  publishedAt: string;
  image?: string;
  url?: string;
}): ArticleFeedRecord {
  return {
    article: {
      id: partial.slug as ArticleId,
      sourceId: "source-1" as SourceId,
      slug: partial.slug,
      canonicalUrl: partial.url ?? `https://example.com/${partial.slug}`,
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

describe("selectYesterdayHighlights", () => {
  it("keeps yesterday's news photos and drops articles, today, and items without a photo", () => {
    const items = selectYesterdayHighlights(
      [
        record({
          slug: "today",
          title: "Hoy",
          sourceSlug: "chilango",
          publishedAt: "2026-11-25T16:00:00.000Z",
          image: "https://img.example/today.jpg",
        }),
        record({
          slug: "yesterday",
          title: "Ayer",
          sourceSlug: "xataka-mx",
          publishedAt: "2026-11-24T16:00:00.000Z",
          image: "https://img.example/yesterday.jpg",
        }),
        record({
          slug: "no-photo",
          title: "Sin foto",
          sourceSlug: "reforma",
          publishedAt: "2026-11-24T15:00:00.000Z",
        }),
        record({
          slug: "older",
          title: "Antes",
          sourceSlug: "sopitas",
          publishedAt: "2026-11-23T16:00:00.000Z",
          image: "https://img.example/older.jpg",
        }),
        record({
          slug: "opinion",
          title: "Una columna",
          sourceSlug: "el-economista",
          publishedAt: "2026-11-24T17:00:00.000Z",
          image: "https://img.example/opinion.jpg",
          url: "https://www.eleconomista.com.mx/opinion/una-columna.html",
        }),
        record({
          slug: "feature",
          title: "Una función",
          sourceSlug: "el-economista",
          publishedAt: "2026-11-24T18:00:00.000Z",
          image: "https://img.example/feature.jpg",
          url: "https://www.eleconomista.com.mx/arteseideas/una-funcion.html",
        }),
        record({
          slug: "magazine",
          title: "Superluna",
          sourceSlug: "chilango",
          publishedAt: "2026-11-24T19:00:00.000Z",
          image: "https://img.example/moon.jpg",
          url: "https://www.chilango.com/noticias/superluna/",
        }),
      ],
      now,
    );

    expect(items.map((item) => item.slug)).toEqual(["yesterday"]);
    expect(items[0]?.src).toContain(encodeURIComponent("https://img.example/yesterday.jpg"));
    expect(items[0]?.subtitle).toBe("Xataka México");
  });
});

describe("getYesterdayHighlights", () => {
  it("asks for this locale since yesterday", async () => {
    const listForFeed = vi.fn(async () => ({ items: [], hasMore: false }));
    const repository = { listForFeed } as unknown as ArticleRepository;

    await getYesterdayHighlights("en", repository, now);

    expect(listForFeed).toHaveBeenCalledWith(
      expect.objectContaining({
        chronological: true,
        languageCodes: ["en"],
        publishedSince: startOfPreviousFeedDay(now).toISOString(),
        publishedBefore: startOfFeedDay(now).toISOString(),
      }),
    );
  });
});

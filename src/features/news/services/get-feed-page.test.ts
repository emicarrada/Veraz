import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => {
    const t = ((key: string) => key) as ((key: string) => string) & {
      raw: (key: string) => string;
    };
    t.raw = (key: string) => key;
    return t;
  }),
  getLocale: vi.fn(async () => "es"),
}));

import type { ArticleId, SourceId } from "@/domain/shared/ids";
import { getFeedPage } from "@/features/news/services/get-feed-page";
import type {
  ArticleFeedRecord,
  ArticleRepository,
  ListFeedArticlesResult,
} from "@/lib/repositories/contracts/article-repository";

const sampleRecord: ArticleFeedRecord = {
  article: {
    id: "article-1" as ArticleId,
    sourceId: "source-1" as SourceId,
    slug: "demo-post-abc12345",
    canonicalUrl: "https://example.com/post",
    urlFingerprint: "fp-1",
    title: "Demo Post",
    excerpt: "Excerpt text",
    contentFormat: "text",
    languageId: "lang-en" as import("@/domain/shared/ids").LanguageId,
    publishedAt: "2026-07-16T12:00:00.000Z",
    ingestedAt: "2026-07-17T00:00:00.000Z",
    updatedAt: "2026-07-17T00:00:00.000Z",
    status: "ingested",
    paywallOriginal: false,
  },
  categorySlug: "general",
  languageCode: "en",
  sourceName: "Demo Source",
  sourceSlug: "demo",
  sourceAttributionName: "Demo Source",
};

function createRepository(result: ListFeedArticlesResult): ArticleRepository {
  return {
    findByUrlFingerprint: vi.fn(),
    findBySlug: vi.fn(),
    save: vi.fn(),
    listForFeed: vi.fn(async () => result),
  };
}

describe("getFeedPage", () => {
  it("returns mapped feed page from repository", async () => {
    const repository = createRepository({
      items: [sampleRecord],
      hasMore: false,
    });

    const result = await getFeedPage({ locale: "es", articleRepository: repository });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0]?.title).toBe("Demo Post");
    expect(result.data.items[0]?.sourceName).toBe("Demo Source");
  });

  it("returns not_configured when repository is unavailable", async () => {
    const result = await getFeedPage({ locale: "es", articleRepository: null });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe("not_configured");
  });

  it("returns load_failed for invalid cursor", async () => {
    const repository = createRepository({ items: [], hasMore: false });
    const result = await getFeedPage({
      locale: "es",
      articleRepository: repository,
      cursor: "invalid-cursor",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe("load_failed");
  });

  it("restricts finanzas feed to prestigious finance sources", async () => {
    const repository = createRepository({ items: [], hasMore: false });
    await getFeedPage({
      locale: "es",
      articleRepository: repository,
      categorySlug: "economia",
    });

    expect(repository.listForFeed).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceSlugs: expect.arrayContaining(["cnbc-top", "marketwatch", "expansion"]),
      }),
    );
    expect(repository.listForFeed).toHaveBeenCalledWith(
      expect.not.objectContaining({ categorySlug: "economia" }),
    );
    expect(repository.listForFeed).toHaveBeenCalledWith(
      expect.not.objectContaining({ languageCodes: ["es"] }),
    );
  });

  it("filters /es deportes to Spanish sources and language only", async () => {
    const repository = createRepository({ items: [], hasMore: false });
    await getFeedPage({
      locale: "es",
      articleRepository: repository,
      categorySlug: "deportes",
    });

    expect(repository.listForFeed).toHaveBeenCalledWith(
      expect.objectContaining({
        languageCodes: ["es"],
        sourceSlugs: expect.arrayContaining(["infobae", "la-nacion"]),
      }),
    );
    expect(repository.listForFeed).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceSlugs: expect.not.arrayContaining(["bbc-sport", "espn-top"]),
      }),
    );
  });

  it("filters /es todas to Spanish sources and language only", async () => {
    const repository = createRepository({ items: [], hasMore: false });
    await getFeedPage({ locale: "es", articleRepository: repository });

    expect(repository.listForFeed).toHaveBeenCalledWith(
      expect.objectContaining({
        languageCodes: ["es"],
        sourceSlugs: expect.not.arrayContaining(["cnbc-top", "techcrunch"]),
      }),
    );
  });

  it("filters /en feed to English articles and EN sources only", async () => {
    const repository = createRepository({ items: [], hasMore: false });
    await getFeedPage({ locale: "en", articleRepository: repository });

    expect(repository.listForFeed).toHaveBeenCalledWith(
      expect.objectContaining({
        languageCodes: ["en"],
        sourceSlugs: expect.arrayContaining(["cnbc-top", "techcrunch"]),
      }),
    );
    expect(repository.listForFeed).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceSlugs: expect.not.arrayContaining(["infobae", "la-nacion"]),
      }),
    );
  });

  it("uses EN-only finance sources on /en economia tab", async () => {
    const repository = createRepository({ items: [], hasMore: false });
    await getFeedPage({
      locale: "en",
      articleRepository: repository,
      categorySlug: "economia",
    });

    expect(repository.listForFeed).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceSlugs: expect.arrayContaining(["cnbc-top", "marketwatch"]),
        languageCodes: ["en"],
      }),
    );
    expect(repository.listForFeed).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceSlugs: expect.not.arrayContaining(["expansion", "bloomberg-linea"]),
      }),
    );
  });
});

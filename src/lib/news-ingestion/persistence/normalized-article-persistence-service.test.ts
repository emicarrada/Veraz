import { describe, expect, it, vi } from "vitest";

import type { Article } from "@/domain/content/article";
import type { Source } from "@/domain/catalog/source";
import type { ArticleId, LanguageId, SourceId } from "@/domain/shared/ids";
import { PersistenceFailedError } from "@/lib/news-ingestion/errors";
import { NormalizedArticleMapper } from "@/lib/news-ingestion/mappers/normalized-article-mapper";
import { NormalizedArticlePersistenceService } from "@/lib/news-ingestion/persistence/normalized-article-persistence-service";
import type { NormalizedArticle } from "@/lib/news-ingestion/types/article";
import type {
  ArticlePersistInput,
  ArticlePersistResult,
  ArticleRepository,
} from "@/lib/repositories/contracts/article-repository";
import type { SourceRepository } from "@/lib/repositories/contracts/source-repository";

const NORMALIZED: NormalizedArticle = {
  providerId: "rss",
  providerItemId: "guid-1",
  sourceSlug: "demo",
  canonicalUrl: "https://example.com/post",
  urlFingerprint: "fp-demo-1",
  title: "Demo Post",
  excerpt: "Excerpt",
  publishedAt: "2026-07-16T12:00:00.000Z",
  languageCode: "en",
  contentFormat: "text",
  paywallOriginal: false,
};

describe("NormalizedArticlePersistenceService", () => {
  const source: Source = {
    id: "source-id" as SourceId,
    slug: "demo",
    name: "Demo Source",
    homepageUrl: "https://example.com",
    feedUrl: "https://example.com/feed.xml",
    trustTier: "unrated",
    status: "active",
    attributionName: "Demo Source",
    createdAt: "2026-07-16T00:00:00.000Z",
    updatedAt: "2026-07-16T00:00:00.000Z",
  };

  const savedArticle: Article = {
    id: "article-id" as ArticleId,
    sourceId: source.id,
    slug: "demo-post-fp-demo",
    canonicalUrl: NORMALIZED.canonicalUrl,
    urlFingerprint: NORMALIZED.urlFingerprint,
    title: NORMALIZED.title,
    excerpt: NORMALIZED.excerpt,
    contentFormat: "text",
    languageId: "lang-en" as LanguageId,
    publishedAt: NORMALIZED.publishedAt,
    ingestedAt: "2026-07-17T00:00:00.000Z",
    updatedAt: "2026-07-17T00:00:00.000Z",
    status: "ingested",
    paywallOriginal: false,
  };

  function createService(options?: {
    created?: boolean;
    saveError?: Error;
  }) {
    const sourceRepository: SourceRepository = {
      findBySlug: vi.fn(async () => source),
      ensureRssSource: vi.fn(async () => source),
    };

    const articleRepository: ArticleRepository = {
      findByUrlFingerprint: vi.fn(async () => null),
      findBySlug: vi.fn(),
      save: vi.fn(async (_input: ArticlePersistInput): Promise<ArticlePersistResult> => {
        if (options?.saveError) throw options.saveError;
        return {
          article: savedArticle,
          created: options?.created ?? true,
        };
      }),
      listForFeed: vi.fn(async () => ({ items: [], hasMore: false })),
    };

    const service = new NormalizedArticlePersistenceService({
      mapper: new NormalizedArticleMapper(),
      sourceRepository,
      articleRepository,
      languageResolver: {
        resolveLanguageId: vi.fn(async () => "lang-en" as LanguageId),
      },
      feedLookup: () => ({
        sourceSlug: "demo",
        feedUrl: "https://example.com/feed.xml",
        defaultLanguageCode: "en",
      }),
    });

    return { service, sourceRepository, articleRepository };
  }

  it("persists mapped article through repositories", async () => {
    const { service, sourceRepository, articleRepository } = createService();

    const result = await service.persistOne(NORMALIZED);

    expect(sourceRepository.ensureRssSource).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "demo" }),
    );
    expect(articleRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceId: source.id,
        languageId: "lang-en",
        article: expect.objectContaining({
          title: "Demo Post",
          urlFingerprint: "fp-demo-1",
          status: "ingested",
        }),
      }),
    );
    expect(result.article.id).toBe("article-id");
    expect(result.created).toBe(true);
  });

  it("counts duplicates in persistMany without failing the batch", async () => {
    const { service } = createService({ created: false });

    const result = await service.persistMany([NORMALIZED, NORMALIZED]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.persisted).toBe(2);
    expect(result.data.skippedDuplicates).toBe(2);
    expect(result.data.failed).toBe(0);
  });

  it("wraps repository failures as PersistenceFailedError", async () => {
    const { service } = createService({ saveError: new Error("db down") });

    await expect(service.persistOne(NORMALIZED)).rejects.toBeInstanceOf(
      PersistenceFailedError,
    );
  });

  it("uses feed defaultTopicGroup when classifier returns general", async () => {
    const { service, articleRepository } = createService();

    const serviceWithFinanceDefault = new NormalizedArticlePersistenceService({
      mapper: new NormalizedArticleMapper(),
      sourceRepository: {
        findBySlug: vi.fn(async () => source),
        ensureRssSource: vi.fn(async () => source),
      },
      articleRepository,
      languageResolver: {
        resolveLanguageId: vi.fn(async () => "lang-en" as LanguageId),
      },
      feedLookup: () => ({
        sourceSlug: "demo",
        feedUrl: "https://example.com/feed.xml",
        defaultTopicGroup: "economia",
      }),
    });

    await serviceWithFinanceDefault.persistOne({
      ...NORMALIZED,
      title: "Daily briefing",
      excerpt: "Neutral headline without category keywords.",
    });

    expect(articleRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ categorySlug: "economia" }),
    );
  });
});

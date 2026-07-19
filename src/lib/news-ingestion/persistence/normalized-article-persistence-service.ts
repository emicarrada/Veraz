import type { Article } from "@/domain/content/article";
import type { RssFeedConfig } from "@/config/domains/news";
import { getRssFeedBySourceSlug } from "@/config/accessors";
import { classifyArticle } from "@/features/news/classification/article-category-classifier";
import { PersistenceFailedError } from "@/lib/news-ingestion/errors";
import { NormalizedArticleMapper } from "@/lib/news-ingestion/mappers/normalized-article-mapper";
import type { NormalizedArticle } from "@/lib/news-ingestion/types/article";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";
import { ingestionFail, ingestionOk } from "@/lib/news-ingestion/utils/ingestion-result";
import type { ArticleRepository } from "@/lib/repositories/contracts/article-repository";
import type { SourceRepository } from "@/lib/repositories/contracts/source-repository";
import type { SupabaseArticleRepository } from "@/lib/repositories/supabase/supabase-article-repository";

export type ArticlePersistenceResult = {
  article: Article;
  created: boolean;
};

export type NormalizedArticlePersistenceOutput = {
  results: ReadonlyArray<ArticlePersistenceResult>;
  persisted: number;
  skippedDuplicates: number;
  failed: number;
};

export type LanguageResolver = {
  resolveLanguageId(languageCode: string): Promise<import("@/domain/shared/ids").LanguageId>;
};

export type NormalizedArticlePersistenceServiceOptions = {
  mapper?: NormalizedArticleMapper;
  sourceRepository: SourceRepository;
  articleRepository: ArticleRepository;
  languageResolver: LanguageResolver;
  feedLookup?: (sourceSlug: string) => RssFeedConfig | undefined;
};

/**
 * Persists NormalizedArticle values via mapper + repositories.
 * No Supabase imports — depends only on repository contracts.
 */
export class NormalizedArticlePersistenceService {
  private readonly mapper: NormalizedArticleMapper;
  private readonly sourceRepository: SourceRepository;
  private readonly articleRepository: ArticleRepository;
  private readonly languageResolver: LanguageResolver;
  private readonly feedLookup: (sourceSlug: string) => RssFeedConfig | undefined;

  constructor(options: NormalizedArticlePersistenceServiceOptions) {
    this.mapper = options.mapper ?? new NormalizedArticleMapper();
    this.sourceRepository = options.sourceRepository;
    this.articleRepository = options.articleRepository;
    this.languageResolver = options.languageResolver;
    this.feedLookup = options.feedLookup ?? getRssFeedBySourceSlug;
  }

  async persistOne(normalized: NormalizedArticle): Promise<ArticlePersistenceResult> {
    try {
      const bundle = this.mapper.map(normalized);
      const feed = this.feedLookup(bundle.sourceSlug);

      const source = await this.sourceRepository.ensureRssSource({
        slug: bundle.sourceSlug,
        feedUrl: feed?.feedUrl ?? normalized.canonicalUrl,
        ...(feed?.defaultLanguageCode
          ? { defaultLanguageCode: feed.defaultLanguageCode }
          : {}),
        ...(normalized.rawMetadata?.feedTitle &&
        typeof normalized.rawMetadata.feedTitle === "string"
          ? { name: normalized.rawMetadata.feedTitle }
          : {}),
      });

      const languageId = await this.languageResolver.resolveLanguageId(bundle.languageCode);
      let categorySlug = classifyArticle({
        title: normalized.title,
        excerpt: normalized.excerpt,
        bodyExcerpt: normalized.bodyExcerpt,
        rssCategories: normalized.categories,
      });

      if (categorySlug === "general" && feed?.defaultTopicGroup) {
        categorySlug = feed.defaultTopicGroup;
      }

      const persistResult = await this.articleRepository.save({
        sourceId: source.id,
        languageId,
        categorySlug,
        article: bundle.article,
        ...(bundle.heroMedia ? { heroMedia: bundle.heroMedia } : {}),
        references: bundle.references,
      });

      return persistResult;
    } catch (error) {
      throw new PersistenceFailedError(
        error instanceof Error ? error.message : "Article persistence failed.",
        { cause: error },
      );
    }
  }

  async persistMany(
    normalizedArticles: ReadonlyArray<NormalizedArticle>,
  ): Promise<IngestionResult<NormalizedArticlePersistenceOutput>> {
    const results: ArticlePersistenceResult[] = [];
    let failed = 0;
    let skippedDuplicates = 0;

    for (const normalized of normalizedArticles) {
      try {
        const result = await this.persistOne(normalized);
        results.push(result);
        if (!result.created) {
          skippedDuplicates += 1;
        }
      } catch {
        failed += 1;
      }
    }

    if (results.length === 0 && normalizedArticles.length > 0) {
      return ingestionFail(
        new PersistenceFailedError("No articles could be persisted."),
      );
    }

    return ingestionOk({
      results,
      persisted: results.length,
      skippedDuplicates,
      failed,
    });
  }
}

export function createLanguageResolverFromArticleRepository(
  articleRepository: SupabaseArticleRepository,
): LanguageResolver {
  return {
    resolveLanguageId: (languageCode) => articleRepository.resolveLanguageId(languageCode),
  };
}

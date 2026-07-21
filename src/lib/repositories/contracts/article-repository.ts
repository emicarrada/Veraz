import type { Source } from "@/domain/catalog/source";
import type { Article } from "@/domain/content/article";
import type { Media } from "@/domain/content/media";
import type { Reference } from "@/domain/content/reference";
import type { ArticleId, LanguageId, SourceId } from "@/domain/shared/ids";
import type { FeedCursor } from "@/lib/repositories/contracts/feed-cursor";
import type { Slug, Url } from "@/domain/shared/value-objects";

import type { NewsCategorySlug } from "@/features/news/classification/categories";

export type ArticlePersistInput = {
  sourceId: SourceId;
  languageId: LanguageId;
  categorySlug: NewsCategorySlug;
  article: Omit<
    Article,
    "id" | "sourceId" | "languageId" | "primaryCountryId" | "heroMediaId"
  >;
  heroMedia?: Omit<Media, "id" | "articleId">;
  references: ReadonlyArray<Omit<Reference, "id" | "articleId">>;
};

export type ArticlePersistResult = {
  article: Article;
  /** False when url_fingerprint already existed (idempotent upsert). */
  created: boolean;
};

/** Feed read model returned by the repository (domain Article + display fields). */
export type ArticleFeedRecord = {
  article: Article;
  categorySlug: NewsCategorySlug;
  languageCode: string;
  sourceName: string;
  sourceSlug: string;
  sourceAttributionName: string;
  heroImageUrl?: Url;
};

export type ListFeedArticlesParams = {
  limit: number;
  cursor?: FeedCursor;
  search?: string;
  categorySlug?: NewsCategorySlug;
  /** When set, only articles from these source slugs are returned. */
  sourceSlugs?: ReadonlyArray<string>;
  /** When set, only articles with matching language codes are returned. */
  languageCodes?: ReadonlyArray<string>;
  /** When set, articles from these source slugs are excluded. */
  excludeSourceSlugs?: ReadonlyArray<string>;
};

export type ListFeedArticlesResult = {
  items: ReadonlyArray<ArticleFeedRecord>;
  nextCursor?: FeedCursor;
  hasMore: boolean;
};

/** Full article read model for the detail page. */
export type ArticleDetailRecord = {
  article: Article;
  categorySlug: NewsCategorySlug;
  languageCode: string;
  source: Pick<Source, "id" | "slug" | "name" | "attributionName" | "homepageUrl">;
  heroMedia?: Media;
  references: ReadonlyArray<Reference>;
};

export type ArticleRepository = {
  findByUrlFingerprint(urlFingerprint: string): Promise<Article | null>;
  findBySlug(slug: Slug): Promise<ArticleDetailRecord | null>;
  save(input: ArticlePersistInput): Promise<ArticlePersistResult>;
  listForFeed(params: ListFeedArticlesParams): Promise<ListFeedArticlesResult>;
};

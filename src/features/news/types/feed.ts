import type { ArticleId } from "@/domain/shared/ids";
import type { Url } from "@/domain/shared/value-objects";
import type { NewsCategorySlug } from "@/features/news/classification/categories";

/**
 * Read model for the public news feed — derived from persisted domain Article.
 */
export type ArticleFeedItem = {
  id: ArticleId;
  slug: string;
  title: string;
  excerpt: string;
  /** Short preview for cards. */
  summary: string;
  categorySlug: NewsCategorySlug;
  categoryLabel: string;
  categoryFallbackImageUrl: Url;
  publishedAt: string;
  canonicalUrl: Url;
  sourceName: string;
  sourceSlug: string;
  sourceAttributionName: string;
  languageCode: string;
  isTranslated: boolean;
  showOriginalLanguageNote: boolean;
  byline?: string;
  heroImageUrl?: Url;
};

export type FeedPage = {
  items: ReadonlyArray<ArticleFeedItem>;
  nextCursor?: string;
  hasMore: boolean;
};

export type FeedLoadErrorCode = "not_configured" | "load_failed";

export type FeedLoadResult =
  | { ok: true; data: FeedPage }
  | { ok: false; error: FeedLoadErrorCode; message: string };

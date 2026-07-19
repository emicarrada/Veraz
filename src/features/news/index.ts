/**
 * News feature — public feed and article presentation.
 */

export {
  FEED_ROUTE,
  DEFAULT_FEED_PAGE_SIZE,
  ARTICLE_DETAIL_REVALIDATE_SECONDS,
  articleDetailPath,
} from "@/features/news/constants";

export type {
  ArticleFeedItem,
  FeedPage,
  FeedLoadResult,
  FeedLoadErrorCode,
} from "@/features/news/types/feed";

export type {
  ArticleDetailItem,
  ArticleDetailReference,
  ArticleDetailLoadResult,
  ArticleDetailLoadErrorCode,
} from "@/features/news/types/article-detail";

export { getFeedPage, getFeedRevalidateSeconds } from "@/features/news/services/get-feed-page";
export {
  getArticleBySlug,
  buildArticleDetailMetadata,
  buildArticleNewsArticleJsonLd,
  buildArticleDetailPath,
  buildArticleDetailUrl,
} from "@/features/news/services/get-article-by-slug";
export { loadMoreFeedArticles } from "@/features/news/actions/load-more-feed";

export { ArticleCard } from "@/features/news/components/article-card";
export { FeedList } from "@/features/news/components/feed-list";
export { FeedHeader } from "@/features/news/components/feed-header";
export { FeedEmptyState } from "@/features/news/components/feed-empty-state";
export { FeedSkeleton } from "@/features/news/components/feed-skeleton";
export { FeedPagination } from "@/features/news/components/feed-pagination";
export { NewsFeedPage } from "@/features/news/components/news-feed-page";
export { NewsAppShell } from "@/features/news/components/news-app-shell";

export { ArticleHeader } from "@/features/news/components/article-header";
export { ArticleMeta } from "@/features/news/components/article-meta";
export { ArticleHeroImage } from "@/features/news/components/article-hero-image";
export { ArticleContent } from "@/features/news/components/article-content";
export { ArticleReferences } from "@/features/news/components/article-references";
export { ArticleNotFound, ArticleNotFoundPage } from "@/features/news/components/article-not-found";
export { ArticleDetailView, ArticleDetailError } from "@/features/news/components/article-detail-view";
export { ArticleJsonLd } from "@/features/news/components/article-json-ld";

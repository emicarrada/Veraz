import type { ArticleFeedRecord } from "@/lib/repositories/contracts/article-repository";
import type { ArticleFeedItem } from "@/features/news/types/feed";
import { classifyArticle } from "@/features/news/classification/article-category-classifier";
import {
  getCategoryFallbackImageUrl,
  getCategoryLabel,
  isBroadStoredTopic,
  type NewsTopicSlug,
} from "@/features/news/classification/categories";
import { formatDisplayText, formatFeedSummary } from "@/features/news/utils/format-display-text";

function resolveCategorySlug(record: ArticleFeedRecord): NewsTopicSlug {
  if (record.categorySlug && !isBroadStoredTopic(record.categorySlug)) {
    return record.categorySlug;
  }

  return classifyArticle({
    title: record.article.title,
    excerpt: record.article.excerpt,
    bodyExcerpt: record.article.bodyExcerpt,
  });
}

export function mapFeedRecordToItem(record: ArticleFeedRecord): ArticleFeedItem {
  const { article } = record;
  const categorySlug = resolveCategorySlug(record);
  const summary = formatFeedSummary(article.excerpt);

  return {
    id: article.id,
    slug: article.slug,
    title: formatDisplayText(article.title),
    excerpt: formatDisplayText(article.excerpt),
    summary,
    categorySlug,
    categoryLabel: getCategoryLabel(categorySlug),
    categoryFallbackImageUrl: getCategoryFallbackImageUrl(categorySlug),
    publishedAt: article.publishedAt,
    canonicalUrl: article.canonicalUrl,
    sourceName: record.sourceName,
    sourceSlug: record.sourceSlug,
    sourceAttributionName: record.sourceAttributionName,
    ...(article.byline ? { byline: formatDisplayText(article.byline) } : {}),
    ...(record.heroImageUrl ? { heroImageUrl: record.heroImageUrl } : {}),
  };
}

import type { ArticleDetailRecord } from "@/lib/repositories/contracts/article-repository";
import type { ArticleDetailItem } from "@/features/news/types/article-detail";
import { classifyArticle } from "@/features/news/classification/article-category-classifier";
import {
  getCategoryFallbackImageUrl,
  getCategoryLabel,
  isBroadStoredTopic,
  type NewsTopicSlug,
} from "@/features/news/classification/categories";
import { formatDisplayText } from "@/features/news/utils/format-display-text";

function resolveDetailCategory(record: ArticleDetailRecord): NewsTopicSlug {
  if (record.categorySlug && !isBroadStoredTopic(record.categorySlug)) {
    return record.categorySlug;
  }

  return classifyArticle({
    title: record.article.title,
    excerpt: record.article.excerpt,
    bodyExcerpt: record.article.bodyExcerpt,
  });
}

export function mapArticleDetailRecord(record: ArticleDetailRecord): ArticleDetailItem {
  const { article, source, heroMedia, references } = record;
  const categorySlug = resolveDetailCategory(record);

  return {
    id: article.id,
    slug: article.slug,
    title: formatDisplayText(article.title),
    excerpt: formatDisplayText(article.excerpt),
    categorySlug,
    categoryLabel: getCategoryLabel(categorySlug),
    categoryFallbackImageUrl: getCategoryFallbackImageUrl(categorySlug),
    publishedAt: article.publishedAt,
    canonicalUrl: article.canonicalUrl,
    languageCode: record.languageCode,
    isTranslated: false,
    showOriginalLanguageNote: false,
    source: {
      name: source.name,
      slug: source.slug,
      attributionName: source.attributionName,
      homepageUrl: source.homepageUrl,
    },
    references: references.map((reference) => ({
      url: reference.url,
      kind: reference.kind,
      ...(reference.title ? { title: formatDisplayText(reference.title) } : {}),
      ...(reference.publisherName ? { publisherName: reference.publisherName } : {}),
    })),
    ...(article.bodyExcerpt ? { bodyExcerpt: formatDisplayText(article.bodyExcerpt) } : {}),
    ...(article.byline ? { byline: formatDisplayText(article.byline) } : {}),
    ...(heroMedia
      ? {
          heroImage: {
            url: heroMedia.url,
            ...(heroMedia.altText ? { altText: heroMedia.altText } : {}),
            ...(heroMedia.credit ? { credit: heroMedia.credit } : {}),
          },
        }
      : {}),
  };
}

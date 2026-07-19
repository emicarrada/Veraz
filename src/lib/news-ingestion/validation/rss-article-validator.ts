import { isExcludedFeedArticleUrl } from "@/lib/news-ingestion/utils/feed-url-policy";
import {
  countHtmlTags,
  INGESTION_FIELD_LIMITS,
  isPublicHttpUrl,
} from "@/lib/news-ingestion/utils/url-security";
import type { NormalizedArticle } from "@/lib/news-ingestion/types/article";
import type {
  ValidationOutput,
  ValidationRejection,
} from "@/lib/news-ingestion/types/validation";

function reject(
  article: NormalizedArticle,
  reason: string,
  code: ValidationRejection["code"],
): ValidationOutput {
  return {
    outcome: "rejected",
    rejection: {
      article,
      reason,
      code,
      rejectedAt: new Date().toISOString(),
    },
  };
}

/**
 * Validates normalized RSS articles before persistence.
 */
export function validateNormalizedArticle(
  article: NormalizedArticle,
): ValidationOutput {
  const now = new Date().toISOString();

  if (!article.title?.trim()) {
    return reject(article, "Missing title.", "missing_field");
  }

  if (!article.excerpt?.trim()) {
    return reject(article, "Missing excerpt.", "missing_field");
  }

  if (!article.canonicalUrl?.trim()) {
    return reject(article, "Missing canonical URL.", "missing_field");
  }

  if (!isPublicHttpUrl(article.canonicalUrl)) {
    return reject(article, "Canonical URL is not a public http(s) URL.", "policy");
  }

  if (isExcludedFeedArticleUrl(article.canonicalUrl)) {
    return reject(article, "Article URL matches exclusion policy.", "policy");
  }

  if (article.title.length > INGESTION_FIELD_LIMITS.titleMax) {
    return reject(article, "Title exceeds maximum length.", "invalid_format");
  }

  if (article.excerpt.length > INGESTION_FIELD_LIMITS.excerptMax) {
    return reject(article, "Excerpt exceeds maximum length.", "invalid_format");
  }

  if (
    article.bodyExcerpt &&
    article.bodyExcerpt.length > INGESTION_FIELD_LIMITS.bodyExcerptMax
  ) {
    return reject(article, "Body excerpt exceeds maximum length.", "invalid_format");
  }

  const htmlTagCount =
    countHtmlTags(article.excerpt) +
    countHtmlTags(article.bodyExcerpt ?? "");

  if (htmlTagCount > INGESTION_FIELD_LIMITS.maxHtmlTagCount) {
    return reject(article, "Too many HTML tags in content.", "invalid_format");
  }

  if (article.heroImageUrl && !isPublicHttpUrl(article.heroImageUrl)) {
    return reject(article, "Hero image URL is not a public http(s) URL.", "policy");
  }

  if (article.references?.length) {
    for (const reference of article.references) {
      if (!isPublicHttpUrl(reference.url)) {
        return reject(article, "Reference URL is not a public http(s) URL.", "policy");
      }
    }
  }

  return {
    outcome: "accepted",
    validated: {
      article,
      validatedAt: now,
    },
  };
}

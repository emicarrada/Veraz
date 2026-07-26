import type { NewsTopicGroup } from "@/features/news/classification/categories";
import { getCategoryFallbackImageUrl } from "@/features/news/classification/categories";
import { resolveFeedLanguageCodes, resolveFeedSourceSlugs } from "@/features/news/config/prestigious-sources";
import { DEFAULT_FEED_PAGE_SIZE } from "@/features/news/constants";
import { articleDetailPath } from "@/i18n/paths";
import type { ArticleId } from "@/domain/shared/ids";
import type { SocialArticleCandidate, SocialPublishConfig, SocialPlatform } from "@/features/social-publishing/types";
import type { ArticleFeedRecord } from "@/lib/repositories/contracts/article-repository";
import type { ArticleRepository } from "@/lib/repositories/contracts/article-repository";
import {
  articleNeedsPlatformWork,
  loadPublicationIndex,
} from "@/lib/social-publishing/social-publication-store";
import { meetsInstagramImpactThreshold } from "@/features/social-publishing/instagram-impact";

function mapFeedRecordToCandidate(
  record: ArticleFeedRecord,
  config: SocialPublishConfig,
): SocialArticleCandidate {
  const locale = config.locale;
  const path = articleDetailPath(locale, record.article.slug);
  return {
    articleId: record.article.id,
    slug: record.article.slug,
    title: record.article.title,
    excerpt: record.article.excerpt,
    categorySlug: record.categorySlug,
    languageCode: record.languageCode,
    sourceSlug: record.sourceSlug,
    sourceName: record.sourceName,
    sourceAttribution: record.sourceAttributionName,
    ...(record.heroImageUrl ? { heroImageUrl: record.heroImageUrl } : {}),
    categoryFallbackImageUrl: `${config.siteUrl}${getCategoryFallbackImageUrl(record.categorySlug)}`,
    locale,
    verazArticleUrl: `${config.siteUrl}${path}`,
  };
}

export async function selectSocialCandidates(
  repository: ArticleRepository,
  config: SocialPublishConfig,
): Promise<SocialArticleCandidate[]> {
  const publicationIndex = await loadPublicationIndex();
  const languageCodes = resolveFeedLanguageCodes(config.locale);
  const sourceSlugs = resolveFeedSourceSlugs(config.locale);
  const platforms: SocialPlatform[] = config.platforms;

  const limit = Math.max(config.maxPostsPerRun * 3, DEFAULT_FEED_PAGE_SIZE);
  const result = await repository.listForFeed({
    limit,
    ...(sourceSlugs?.length ? { sourceSlugs: [...sourceSlugs] } : {}),
    ...(languageCodes?.length ? { languageCodes: [...languageCodes] } : {}),
  });

  const candidates: SocialArticleCandidate[] = [];
  for (const record of result.items) {
    const id = record.article.id as ArticleId;
    if (!articleNeedsPlatformWork(id, platforms, publicationIndex)) continue;
    const candidate = mapFeedRecordToCandidate(record, config);
    if (
      config.instagramHighImpactOnly &&
      platforms.includes("instagram") &&
      platforms.every((p) => p === "instagram") &&
      !meetsInstagramImpactThreshold(candidate, config.instagramMinImpactScore)
    ) {
      continue;
    }
    if (
      config.instagramHighImpactOnly &&
      platforms.includes("instagram_reels") &&
      !meetsInstagramImpactThreshold(candidate, config.instagramMinImpactScore)
    ) {
      continue;
    }
    candidates.push(candidate);
    if (candidates.length >= config.maxPostsPerRun) break;
  }

  return candidates;
}

export async function selectLatestSocialCandidateForCategory(
  repository: ArticleRepository,
  config: SocialPublishConfig,
  categoryGroup: NewsTopicGroup,
): Promise<SocialArticleCandidate | null> {
  const publicationIndex = await loadPublicationIndex();
  const languageCodes = resolveFeedLanguageCodes(config.locale);
  const sourceSlugs = resolveFeedSourceSlugs(config.locale);
  const platforms: SocialPlatform[] = config.platforms;

  const result = await repository.listForFeed({
    limit: 40,
    categorySlug: categoryGroup,
    ...(sourceSlugs?.length ? { sourceSlugs: [...sourceSlugs] } : {}),
    ...(languageCodes?.length ? { languageCodes: [...languageCodes] } : {}),
  });

  for (const record of result.items) {
    const id = record.article.id as ArticleId;
    if (!articleNeedsPlatformWork(id, platforms, publicationIndex)) continue;
    return mapFeedRecordToCandidate(record, config);
  }

  return null;
}

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
  meetsSocialReachThreshold,
  socialReachScore,
} from "@/features/social-publishing/social-reach-score";
import {
  articleNeedsPlatformWork,
  loadPublicationIndex,
} from "@/lib/social-publishing/social-publication-store";

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

function needsHeroForPlatforms(platforms: SocialPlatform[], config: SocialPublishConfig): boolean {
  if (!config.reachRequireHeroForVisual) return false;
  return platforms.some((p) => p === "instagram" || p === "instagram_reels" || p === "tiktok");
}

function passesReachGate(
  candidate: SocialArticleCandidate,
  config: SocialPublishConfig,
  platforms: SocialPlatform[],
): boolean {
  if (!config.highReachOnly) {
    return true;
  }
  return meetsSocialReachThreshold(candidate, {
    minScore: config.minReachScore,
    requireHeroForVisual: needsHeroForPlatforms(platforms, config),
    tier1SourceSlugs: config.reachTier1SourceSlugs,
  });
}

export async function selectSocialCandidates(
  repository: ArticleRepository,
  config: SocialPublishConfig,
): Promise<SocialArticleCandidate[]> {
  const publicationIndex = await loadPublicationIndex();
  const languageCodes = resolveFeedLanguageCodes(config.locale);
  const sourceSlugs = resolveFeedSourceSlugs(config.locale);
  const platforms: SocialPlatform[] = config.platforms;

  const limit = Math.max(config.maxPostsPerRun * 12, DEFAULT_FEED_PAGE_SIZE, 48);
  const result = await repository.listForFeed({
    limit,
    ...(sourceSlugs?.length ? { sourceSlugs: [...sourceSlugs] } : {}),
    ...(languageCodes?.length ? { languageCodes: [...languageCodes] } : {}),
  });

  const scored: { candidate: SocialArticleCandidate; score: number; order: number }[] = [];

  for (let order = 0; order < result.items.length; order += 1) {
    const record = result.items[order]!;
    const id = record.article.id as ArticleId;
    if (!articleNeedsPlatformWork(id, platforms, publicationIndex)) continue;

    const candidate = mapFeedRecordToCandidate(record, config);
    if (!passesReachGate(candidate, config, platforms)) continue;

    scored.push({
      candidate,
      score: socialReachScore(candidate, { tier1SourceSlugs: config.reachTier1SourceSlugs }),
      order,
    });
  }

  scored.sort((a, b) => b.score - a.score || a.order - b.order);

  const candidates = scored.slice(0, config.maxPostsPerRun).map((row) => row.candidate);

  if (config.highReachOnly && candidates.length === 0 && scored.length === 0) {
    console.log(
      `[social:reach] Ningún candidato alcanza score≥${config.minReachScore} (hero visual=${needsHeroForPlatforms(platforms, config)}) — slot vacío.`,
    );
  } else if (candidates[0]) {
    const top = candidates[0];
    const score = socialReachScore(top, { tier1SourceSlugs: config.reachTier1SourceSlugs });
    console.log(`[social:reach] Elegido score=${score} slug=${top.slug} cat=${top.categorySlug}`);
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

  let best: { candidate: SocialArticleCandidate; score: number; order: number } | null = null;

  for (let order = 0; order < result.items.length; order += 1) {
    const record = result.items[order]!;
    const id = record.article.id as ArticleId;
    if (!articleNeedsPlatformWork(id, platforms, publicationIndex)) continue;

    const candidate = mapFeedRecordToCandidate(record, config);
    if (!passesReachGate(candidate, config, platforms)) continue;

    const row = {
      candidate,
      score: socialReachScore(candidate, { tier1SourceSlugs: config.reachTier1SourceSlugs }),
      order,
    };
    if (!best || row.score > best.score || (row.score === best.score && row.order < best.order)) {
      best = row;
    }
  }

  return best?.candidate ?? null;
}

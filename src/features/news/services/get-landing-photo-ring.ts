import { catalogLabelForSlug } from "@/config/domains/rss-feed-catalog";
import {
  resolveFeedLanguageCodes,
  resolveFeedSourceSlugs,
} from "@/features/news/config/prestigious-sources";
import { mapFeedRecordToItem } from "@/features/news/services/feed-mapper";
import { startOfFeedDay } from "@/features/news/utils/feed-day";
import { isNewsOutlet, isNewsReportUrl } from "@/features/news/utils/news-report";
import type { Locale } from "@/i18n/routing";
import type { ArticleFeedRecord, ArticleRepository } from "@/lib/repositories/contracts/article-repository";
import { createContentRepositories } from "@/lib/repositories/factory";

export type LandingPhotoRingItem = {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  slug: string;
};

const RING_LIMIT = 10;
const QUERY_LIMIT = 80;

function withPhoto(records: readonly ArticleFeedRecord[]): ArticleFeedRecord[] {
  return records.filter(
    (record) =>
      Boolean(record.heroImageUrl) &&
      isNewsOutlet(record.sourceSlug) &&
      isNewsReportUrl(record.article.canonicalUrl),
  );
}

function takeDiverse(records: readonly ArticleFeedRecord[], limit: number): ArticleFeedRecord[] {
  const picked: ArticleFeedRecord[] = [];
  const seenSources = new Set<string>();

  for (const record of records) {
    if (seenSources.has(record.sourceSlug)) continue;
    seenSources.add(record.sourceSlug);
    picked.push(record);
    if (picked.length === limit) return picked;
  }

  for (const record of records) {
    if (picked.includes(record)) continue;
    picked.push(record);
    if (picked.length === limit) break;
  }

  return picked;
}

/** News photos published today in the feed timezone. */
export function selectLandingPhotoRing(
  records: readonly ArticleFeedRecord[],
  now = new Date(),
  limit = RING_LIMIT,
): LandingPhotoRingItem[] {
  const todayStart = startOfFeedDay(now).getTime();
  const today = withPhoto(records).filter(
    (record) => new Date(record.article.publishedAt).getTime() >= todayStart,
  );

  return takeDiverse(today, limit).map((record) => {
    const item = mapFeedRecordToItem(record);
    const source = catalogLabelForSlug(record.sourceSlug) ?? item.sourceName;
    return {
      src: item.heroImageUrl ?? "",
      alt: item.title,
      title: item.title,
      subtitle: source,
      slug: item.slug,
    };
  });
}

export async function getLandingPhotoRing(
  locale: Locale,
  articleRepository?: ArticleRepository | null,
  now = new Date(),
): Promise<LandingPhotoRingItem[]> {
  const repository =
    articleRepository === undefined
      ? (createContentRepositories()?.articleRepository ?? null)
      : articleRepository;
  if (!repository) return [];

  const languageCodes = resolveFeedLanguageCodes(locale);
  const sourceSlugs = resolveFeedSourceSlugs(locale);
  const result = await repository.listForFeed({
    limit: QUERY_LIMIT,
    chronological: true,
    publishedSince: startOfFeedDay(now).toISOString(),
    ...(languageCodes?.length ? { languageCodes: [...languageCodes] } : {}),
    ...(sourceSlugs?.length ? { sourceSlugs: [...sourceSlugs] } : {}),
  });

  return selectLandingPhotoRing(result.items, now);
}

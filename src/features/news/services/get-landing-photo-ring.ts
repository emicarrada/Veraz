import { catalogLabelForSlug } from "@/config/domains/rss-feed-catalog";
import {
  resolveFeedLanguageCodes,
  resolveFeedSourceSlugs,
} from "@/features/news/config/prestigious-sources";
import { mapFeedRecordToItem } from "@/features/news/services/feed-mapper";
import { startOfFeedDay, startOfPreviousFeedDay } from "@/features/news/utils/feed-day";
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
const TODAY_ENOUGH = 6;
const QUERY_LIMIT = 50;

function withPhoto(records: readonly ArticleFeedRecord[]): ArticleFeedRecord[] {
  return records.filter((record) => Boolean(record.heroImageUrl));
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

/** Photos from today. Yesterday fills the ring only when today is still short. */
export function selectLandingPhotoRing(
  records: readonly ArticleFeedRecord[],
  now = new Date(),
  limit = RING_LIMIT,
): LandingPhotoRingItem[] {
  const photos = withPhoto(records);
  const todayStart = startOfFeedDay(now).getTime();
  const today = photos.filter((record) => new Date(record.article.publishedAt).getTime() >= todayStart);
  const pool = today.length >= TODAY_ENOUGH ? today : photos;

  return takeDiverse(pool, limit).map((record) => {
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
    publishedSince: startOfPreviousFeedDay(now).toISOString(),
    ...(languageCodes?.length ? { languageCodes: [...languageCodes] } : {}),
    ...(sourceSlugs?.length ? { sourceSlugs: [...sourceSlugs] } : {}),
  });

  return selectLandingPhotoRing(result.items, now);
}

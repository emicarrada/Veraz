import { catalogLabelForSlug } from "@/config/domains/rss-feed-catalog";
import {
  resolveFeedLanguageCodes,
  resolveFeedSourceSlugs,
} from "@/features/news/config/prestigious-sources";
import { mapFeedRecordToItem } from "@/features/news/services/feed-mapper";
import { startOfFeedDay, startOfPreviousFeedDay } from "@/features/news/utils/feed-day";
import { homeFeedSlugs } from "@/features/news/utils/home-feed";
import type { Locale } from "@/i18n/routing";
import type { ArticleFeedRecord, ArticleRepository } from "@/lib/repositories/contracts/article-repository";
import { createContentRepositories } from "@/lib/repositories/factory";

export type YesterdayHighlight = {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  slug: string;
};

const HIGHLIGHT_LIMIT = 10;
const QUERY_LIMIT = 50;

function heroProxySrc(url: string): string {
  return `/api/hero-image?src=${encodeURIComponent(url)}`;
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

/** Yesterday only, in Mexico City. Own photos, one outlet first, then the rest of that order. */
export function selectYesterdayHighlights(
  records: readonly ArticleFeedRecord[],
  now = new Date(),
  limit = HIGHLIGHT_LIMIT,
): YesterdayHighlight[] {
  const start = startOfPreviousFeedDay(now).getTime();
  const end = startOfFeedDay(now).getTime();
  const yesterday = records.filter((record) => {
    if (!record.heroImageUrl) return false;
    const published = new Date(record.article.publishedAt).getTime();
    return published >= start && published < end;
  });

  return takeDiverse(yesterday, limit).map((record) => {
    const item = mapFeedRecordToItem(record);
    const source = catalogLabelForSlug(record.sourceSlug) ?? item.sourceName;
    return {
      src: heroProxySrc(item.heroImageUrl ?? ""),
      alt: item.title,
      title: item.title,
      subtitle: source,
      slug: item.slug,
    };
  });
}

export async function getYesterdayHighlights(
  locale: Locale,
  visitorCountry?: string,
  articleRepository?: ArticleRepository | null,
  now = new Date(),
): Promise<YesterdayHighlight[]> {
  const repository =
    articleRepository === undefined
      ? (createContentRepositories()?.articleRepository ?? null)
      : articleRepository;
  if (!repository) return [];

  const languageCodes = resolveFeedLanguageCodes(locale);
  const sourceSlugs = resolveFeedSourceSlugs(locale);
  const home = visitorCountry
    ? homeFeedSlugs(visitorCountry, sourceSlugs)
    : { home: [] as readonly string[], lead: [] as readonly string[] };

  const result = await repository.listForFeed({
    limit: QUERY_LIMIT,
    publishedSince: startOfPreviousFeedDay(now).toISOString(),
    publishedBefore: startOfFeedDay(now).toISOString(),
    ...(languageCodes?.length ? { languageCodes: [...languageCodes] } : {}),
    ...(sourceSlugs?.length ? { sourceSlugs: [...sourceSlugs] } : {}),
    ...(home.home.length
      ? { prioritizeSourceSlugs: [...home.home], leadSourceSlugs: [...home.lead] }
      : { chronological: true }),
  });

  return selectYesterdayHighlights(result.items, now);
}

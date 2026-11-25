import { getTranslations } from "next-intl/server";

import { getCacheConfig } from "@/config/accessors";
import { DEFAULT_FEED_PAGE_SIZE } from "@/features/news/constants";
import { mapFeedRecordToItem } from "@/features/news/services/feed-mapper";
import { resolveArticlesDisplay } from "@/features/news/services/resolve-article-display";
import type { FeedLoadResult, FeedPage } from "@/features/news/types/feed";
import { formatFeedSummary } from "@/features/news/utils/format-display-text";
import { homeFeedSlugs } from "@/features/news/utils/home-feed";
import { sortFeedItemsByPublishedAt } from "@/features/news/utils/sort-feed-items";
import type { Locale } from "@/i18n/routing";
import { encodeFeedCursor, decodeFeedCursor } from "@/lib/repositories/contracts/feed-cursor";
import type { ArticleRepository } from "@/lib/repositories/contracts/article-repository";
import { createContentRepositories } from "@/lib/repositories/factory";

import { getTopicGroup, getTopicSlugsForFilter, isNewsTopicSlug, type NewsCategorySlug } from "@/features/news/classification/categories";
import {
  isPrestigiousFeedGroup,
  resolveFeedLanguageCodes,
  resolveFeedSourceSlugs,
  resolvePrestigiousFeedQuery,
} from "@/features/news/config/prestigious-sources";
import { sourceSlugsForCountry } from "@/config/domains/rss-feed-catalog";

export type GetFeedPageParams = {
  locale: Locale;
  limit?: number;
  cursor?: string | null;
  search?: string;
  categorySlug?: NewsCategorySlug;
  /** ISO country from the request. Main feed only; category tabs stay chronological. */
  visitorCountry?: string;
  /** Saved home. Main feed only, and only after the reader finishes the chips. */
  readerPreferences?: { countryCodes: readonly string[]; topicSlugs: readonly string[] } | null;
  /** Explicit null skips factory lookup (tests). */
  articleRepository?: ArticleRepository | null;
};

export async function getFeedPage(params: GetFeedPageParams): Promise<FeedLoadResult> {
  const tErrors = await getTranslations("errors");
  const tFeed = await getTranslations("feed.categories");
  const limit = params.limit ?? DEFAULT_FEED_PAGE_SIZE;
  const repository =
    params.articleRepository === undefined
      ? (createContentRepositories()?.articleRepository ?? null)
      : params.articleRepository;

  if (!repository) {
    return {
      ok: false,
      error: "not_configured",
      message: tErrors("dbNotConfigured"),
    };
  }

  try {
    const decodedCursor = params.cursor ? decodeFeedCursor(params.cursor) : undefined;
    if (params.cursor && !decodedCursor) {
      return {
        ok: false,
        error: "load_failed",
        message: tErrors("invalidCursor"),
      };
    }

    const prestigiousQuery = resolvePrestigiousFeedQuery(params.categorySlug, params.locale);
    const languageCodes = resolveFeedLanguageCodes(params.locale, params.categorySlug);
    const localeSourceSlugs = resolveFeedSourceSlugs(params.locale, prestigiousQuery.sourceSlugs);
    const reader =
      !params.categorySlug && params.readerPreferences
        ? params.readerPreferences
        : null;
    const readerSourceSlugs = reader
      ? [
          ...new Set(
            reader.countryCodes.flatMap((code) =>
              sourceSlugsForCountry(code).filter(
                (slug) => !localeSourceSlugs || localeSourceSlugs.includes(slug),
              ),
            ),
          ),
        ]
      : null;
    const readerCategorySlugs = reader
      ? [
          ...new Set(
            reader.topicSlugs.flatMap((slug) =>
              isNewsTopicSlug(slug) ? getTopicSlugsForFilter(slug) : [],
            ),
          ),
        ]
      : null;

    if (reader && (readerSourceSlugs?.length === 0 || readerCategorySlugs?.length === 0)) {
      return { ok: true, data: { items: [], hasMore: false } };
    }

    const sourceSlugs = readerSourceSlugs ?? localeSourceSlugs;
    const home = params.categorySlug || reader || !params.visitorCountry
      ? { home: [] as readonly string[], lead: [] as readonly string[], leadExclusive: false }
      : homeFeedSlugs(params.visitorCountry, sourceSlugs);

    const result = await repository.listForFeed({
      limit,
      ...(decodedCursor ? { cursor: decodedCursor } : {}),
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
      ...(prestigiousQuery.categorySlug
        ? { categorySlug: prestigiousQuery.categorySlug }
        : {}),
      ...(readerCategorySlugs?.length ? { categorySlugs: readerCategorySlugs } : {}),
      ...(reader ? { chronological: true } : {}),
      ...(sourceSlugs?.length ? { sourceSlugs: [...sourceSlugs] } : {}),
      ...(languageCodes?.length ? { languageCodes: [...languageCodes] } : {}),
      ...(home.home.length
        ? {
            prioritizeSourceSlugs: [...home.home],
            leadSourceSlugs: [...home.lead],
            ...(home.leadExclusive ? { leadExclusive: true } : {}),
          }
        : {}),
    });

    const baseItems = result.items.map(mapFeedRecordToItem);
    const displays = await resolveArticlesDisplay(
      params.locale,
      baseItems.map((item) => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        languageCode: item.languageCode,
      })),
      undefined,
      {
        translate:
          params.locale === "es" &&
          params.categorySlug != null &&
          isPrestigiousFeedGroup(getTopicGroup(params.categorySlug)),
      },
    );

    const localizedItems = baseItems.map((item) => {
      const display = displays.get(item.id);
      const categoryLabel = tFeed(item.categorySlug);
      if (!display) {
        return { ...item, categoryLabel };
      }

      return {
        ...item,
        title: display.title,
        excerpt: display.excerpt,
        summary: formatFeedSummary(display.excerpt),
        categoryLabel,
        isTranslated: display.isTranslated,
        showOriginalLanguageNote: display.showOriginalLanguageNote,
        languageCode: display.sourceLanguageCode,
      };
    });

    const page: FeedPage = {
      items: home.home.length ? localizedItems : sortFeedItemsByPublishedAt(localizedItems),
      hasMore: result.hasMore,
      ...(result.nextCursor ? { nextCursor: encodeFeedCursor(result.nextCursor) } : {}),
    };

    return { ok: true, data: page };
  } catch (error) {
    return {
      ok: false,
      error: "load_failed",
      message: error instanceof Error ? error.message : tErrors("loadFailed"),
    };
  }
}

export function getFeedRevalidateSeconds(): number {
  return getCacheConfig().feedRevalidateSeconds;
}

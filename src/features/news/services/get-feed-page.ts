import { getTranslations } from "next-intl/server";

import { getCacheConfig } from "@/config/accessors";
import { DEFAULT_FEED_PAGE_SIZE } from "@/features/news/constants";
import { mapFeedRecordToItem } from "@/features/news/services/feed-mapper";
import { resolveArticlesDisplay } from "@/features/news/services/resolve-article-display";
import type { FeedLoadResult, FeedPage } from "@/features/news/types/feed";
import { formatFeedSummary } from "@/features/news/utils/format-display-text";
import { sortFeedItemsByPublishedAt } from "@/features/news/utils/sort-feed-items";
import type { Locale } from "@/i18n/routing";
import { encodeFeedCursor, decodeFeedCursor } from "@/lib/repositories/contracts/feed-cursor";
import type { ArticleRepository } from "@/lib/repositories/contracts/article-repository";
import { createContentRepositories } from "@/lib/repositories/factory";

import type { NewsCategorySlug } from "@/features/news/classification/categories";
import {
  resolveFeedLanguageCodes,
  resolveFeedSourceSlugs,
  resolvePrestigiousFeedQuery,
} from "@/features/news/config/prestigious-sources";

export type GetFeedPageParams = {
  locale: Locale;
  limit?: number;
  cursor?: string | null;
  search?: string;
  categorySlug?: NewsCategorySlug;
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
    const sourceSlugs = resolveFeedSourceSlugs(params.locale, prestigiousQuery.sourceSlugs);

    const result = await repository.listForFeed({
      limit,
      ...(decodedCursor ? { cursor: decodedCursor } : {}),
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
      ...(prestigiousQuery.categorySlug
        ? { categorySlug: prestigiousQuery.categorySlug }
        : {}),
      ...(sourceSlugs?.length ? { sourceSlugs: [...sourceSlugs] } : {}),
      ...(languageCodes?.length ? { languageCodes: [...languageCodes] } : {}),
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
      items: sortFeedItemsByPublishedAt(localizedItems),
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

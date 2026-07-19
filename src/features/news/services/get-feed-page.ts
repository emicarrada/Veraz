import { getCacheConfig } from "@/config/accessors";
import { DEFAULT_FEED_PAGE_SIZE } from "@/features/news/constants";
import { mapFeedRecordToItem } from "@/features/news/services/feed-mapper";
import type { FeedLoadResult, FeedPage } from "@/features/news/types/feed";
import { sortFeedItemsByPublishedAt } from "@/features/news/utils/sort-feed-items";
import { encodeFeedCursor, decodeFeedCursor } from "@/lib/repositories/contracts/feed-cursor";
import type { ArticleRepository } from "@/lib/repositories/contracts/article-repository";
import { createContentRepositories } from "@/lib/repositories/factory";

import type { NewsCategorySlug } from "@/features/news/classification/categories";
import { resolvePrestigiousFeedQuery } from "@/features/news/config/prestigious-sources";

export type GetFeedPageParams = {
  limit?: number;
  cursor?: string | null;
  search?: string;
  categorySlug?: NewsCategorySlug;
  /** Explicit null skips factory lookup (tests). */
  articleRepository?: ArticleRepository | null;
};

export async function getFeedPage(params: GetFeedPageParams = {}): Promise<FeedLoadResult> {
  const limit = params.limit ?? DEFAULT_FEED_PAGE_SIZE;
  const repository =
    params.articleRepository === undefined
      ? (createContentRepositories()?.articleRepository ?? null)
      : params.articleRepository;

  if (!repository) {
    return {
      ok: false,
      error: "not_configured",
      message: "La base de datos no está configurada.",
    };
  }

  try {
    const decodedCursor = params.cursor ? decodeFeedCursor(params.cursor) : undefined;
    if (params.cursor && !decodedCursor) {
      return {
        ok: false,
        error: "load_failed",
        message: "Cursor de paginación inválido.",
      };
    }

    const prestigiousQuery = resolvePrestigiousFeedQuery(params.categorySlug);

    const result = await repository.listForFeed({
      limit,
      ...(decodedCursor ? { cursor: decodedCursor } : {}),
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
      ...(prestigiousQuery.categorySlug
        ? { categorySlug: prestigiousQuery.categorySlug }
        : {}),
      ...(prestigiousQuery.sourceSlugs?.length
        ? { sourceSlugs: prestigiousQuery.sourceSlugs }
        : {}),
    });

    const page: FeedPage = {
      items: sortFeedItemsByPublishedAt(result.items.map(mapFeedRecordToItem)),
      hasMore: result.hasMore,
      ...(result.nextCursor
        ? { nextCursor: encodeFeedCursor(result.nextCursor) }
        : {}),
    };

    return { ok: true, data: page };
  } catch (error) {
    return {
      ok: false,
      error: "load_failed",
      message:
        error instanceof Error ? error.message : "No se pudo cargar el feed de noticias.",
    };
  }
}

export function getFeedRevalidateSeconds(): number {
  return getCacheConfig().feedRevalidateSeconds;
}

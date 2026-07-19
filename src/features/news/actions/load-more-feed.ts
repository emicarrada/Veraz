"use server";

import { getFeedPage } from "@/features/news/services/get-feed-page";
import type { FeedLoadResult } from "@/features/news/types/feed";
import { parseCategorySlug } from "@/features/news/classification/categories";

export type LoadMoreFeedParams = {
  cursor: string;
  search?: string;
  categorySlug?: string;
};

export async function loadMoreFeedArticles(
  params: LoadMoreFeedParams,
): Promise<FeedLoadResult> {
  return getFeedPage({
    cursor: params.cursor,
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(parseCategorySlug(params.categorySlug) ? { categorySlug: parseCategorySlug(params.categorySlug) } : {}),
  });
}

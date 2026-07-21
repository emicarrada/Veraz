"use server";

import { getLocale } from "next-intl/server";

import { getFeedPage } from "@/features/news/services/get-feed-page";
import type { FeedLoadResult } from "@/features/news/types/feed";
import { parseCategorySlug } from "@/features/news/classification/categories";
import type { Locale } from "@/i18n/routing";

export type LoadMoreFeedParams = {
  cursor: string;
  search?: string;
  categorySlug?: string;
};

export async function loadMoreFeedArticles(
  params: LoadMoreFeedParams,
): Promise<FeedLoadResult> {
  const locale = (await getLocale()) as Locale;

  return getFeedPage({
    locale,
    cursor: params.cursor,
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(parseCategorySlug(params.categorySlug)
      ? { categorySlug: parseCategorySlug(params.categorySlug) }
      : {}),
  });
}

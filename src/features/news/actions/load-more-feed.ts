"use server";

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";

import { getActiveReaderPreferences } from "@/features/auth";
import { getFeedPage } from "@/features/news/services/get-feed-page";
import type { FeedLoadResult } from "@/features/news/types/feed";
import { parseCategorySlug } from "@/features/news/classification/categories";
import { resolveVisitorCountry } from "@/features/news/utils/visitor-country";
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
  const categorySlug = parseCategorySlug(params.categorySlug);
  const reader = categorySlug ? null : await getActiveReaderPreferences();

  return getFeedPage({
    locale,
    visitorCountry: resolveVisitorCountry(await headers()),
    cursor: params.cursor,
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(categorySlug ? { categorySlug } : {}),
    ...(reader
      ? { readerPreferences: { countryCodes: reader.countryCodes, topicSlugs: reader.topicSlugs } }
      : {}),
  });
}

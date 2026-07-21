import type { Locale } from "@/i18n/routing";

export const DEFAULT_FEED_PAGE_SIZE = 12;

/** Max characters for feed card summary (short preview). */
export const FEED_SUMMARY_MAX_LENGTH = 180;

export const ARTICLE_DETAIL_REVALIDATE_SECONDS = 120;

/** @deprecated Use feedPath(locale) from @/i18n/paths */
export const FEED_ROUTE = "/noticias" as const;

/** @deprecated Use articleDetailPath(locale, slug) from @/i18n/paths */
export function articleDetailPath(slug: string): string {
  return `${FEED_ROUTE}/${slug}`;
}

/** @deprecated Use feedReturnPath(locale, categorySlug) from @/i18n/paths */
export function feedReturnHref(categorySlug?: string): string {
  if (!categorySlug || categorySlug === "general") {
    return FEED_ROUTE;
  }

  return `${FEED_ROUTE}?categoria=${encodeURIComponent(categorySlug)}`;
}

export type { Locale };

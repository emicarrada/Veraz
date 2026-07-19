export const DEFAULT_FEED_PAGE_SIZE = 12;

/** Max characters for feed card summary (short preview). */
export const FEED_SUMMARY_MAX_LENGTH = 180;

export const FEED_ROUTE = "/noticias" as const;

export const ARTICLE_DETAIL_REVALIDATE_SECONDS = 120;

export function articleDetailPath(slug: string): string {
  return `${FEED_ROUTE}/${slug}`;
}

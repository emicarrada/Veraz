import { isBlockedNewsHost } from "@/config/domains/rss-feed-catalog";

/**
 * URLs that should not enter the news feed (live blogs, tickers, blocked hosts).
 */
export function isExcludedFeedArticleUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (isBlockedNewsHost(parsed.hostname)) return true;
    return parsed.pathname.toLowerCase().includes("/live/");
  } catch {
    return false;
  }
}

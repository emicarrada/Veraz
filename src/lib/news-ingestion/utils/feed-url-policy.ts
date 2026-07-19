/**
 * URLs that should not enter the news feed (live blogs, tickers, etc.).
 */
export function isExcludedFeedArticleUrl(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return pathname.includes("/live/");
  } catch {
    return false;
  }
}

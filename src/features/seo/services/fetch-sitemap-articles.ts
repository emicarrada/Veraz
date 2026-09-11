import { createContentRepositories } from "@/lib/repositories/factory";
import type { SitemapArticleRecord } from "@/lib/repositories/contracts/article-repository";
import type { FeedCursor } from "@/lib/repositories/contracts/feed-cursor";

const SITEMAP_PAGE_SIZE = 500;

export async function fetchAllSitemapArticles(): Promise<ReadonlyArray<SitemapArticleRecord>> {
  const repos = createContentRepositories();
  if (!repos) return [];

  const all: SitemapArticleRecord[] = [];
  let cursor: FeedCursor | undefined;

  do {
    const page = await repos.articleRepository.listPublishedForSitemap({
      limit: SITEMAP_PAGE_SIZE,
      ...(cursor ? { cursor } : {}),
    });

    all.push(...page.items);
    cursor = page.hasMore ? page.nextCursor : undefined;
  } while (cursor);

  return all;
}

export async function fetchRecentNewsSitemapArticles(
  hours = 48,
): Promise<ReadonlyArray<SitemapArticleRecord>> {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const articles = await fetchAllSitemapArticles();
  return articles.filter((article) => new Date(article.publishedAt).getTime() >= cutoff);
}

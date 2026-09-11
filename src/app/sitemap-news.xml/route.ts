import { getAppConfig } from "@/config";
import { fetchRecentNewsSitemapArticles } from "@/features/seo/services/fetch-sitemap-articles";
import { buildNewsSitemapXml } from "@/features/seo/sitemap-urls";

export const revalidate = 300;

export async function GET(): Promise<Response> {
  const { siteUrl } = getAppConfig();
  const articles = await fetchRecentNewsSitemapArticles(48);
  const xml = buildNewsSitemapXml(articles, siteUrl);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}

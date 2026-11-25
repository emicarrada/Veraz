import { getAppConfig } from "@/config";
import { buildLlmsFullTxt } from "@/features/seo/llms-document";
import { fetchAllSitemapArticles } from "@/features/seo/services/fetch-sitemap-articles";

export const revalidate = 600;

export async function GET(): Promise<Response> {
  const { siteUrl } = getAppConfig();
  const articles = await fetchAllSitemapArticles();
  return new Response(buildLlmsFullTxt(siteUrl, articles), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800",
    },
  });
}

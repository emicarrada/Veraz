import { getAppConfig } from "@/config";
import { fetchAllSitemapArticles } from "@/features/seo/services/fetch-sitemap-articles";
import { articleDetailPath } from "@/i18n/paths";

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const { siteUrl } = getAppConfig();
  const base = siteUrl.replace(/\/$/, "");
  const articles = await fetchAllSitemapArticles();

  const lines = [
    "# Veraz — Artículos recientes (es)",
    "",
    ...articles.slice(0, 200).map((article) => `${base}${articleDetailPath("es", article.slug)}`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}

import { getAppConfig } from "@/config";
import { isArticleAccessibleForLocale } from "@/features/news/config/prestigious-sources";
import {
  NEWS_FEED_TAB_ORDER,
  type NewsTopicGroup,
} from "@/features/news/classification/categories";
import { articleDetailPath, feedPath, homePath, staticPath, feedCategoryPath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";
import { locales } from "@/i18n/routing";
import { fetchAllSitemapArticles } from "@/features/seo/services/fetch-sitemap-articles";
import { localePriority, STATIC_PAGE_SEGMENTS } from "@/features/seo/build-page-metadata";
import type { MetadataRoute } from "next";

export function isCategoryLandingSlug(slug: string): slug is NewsTopicGroup {
  return (NEWS_FEED_TAB_ORDER as readonly string[]).includes(slug);
}

export async function buildMainSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const { siteUrl } = getAppConfig();
  const base = siteUrl.replace(/\/$/, "");
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const priority = localePriority(locale);

    entries.push({
      url: `${base}${homePath(locale)}`,
      lastModified: now,
      changeFrequency: "daily",
      priority,
    });

    entries.push({
      url: `${base}${feedPath(locale)}`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: priority * 0.9,
    });

    for (const segment of STATIC_PAGE_SEGMENTS) {
      entries.push({
        url: `${base}${staticPath(locale, `/${segment}`)}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: priority * 0.6,
      });
    }

    for (const category of NEWS_FEED_TAB_ORDER) {
      entries.push({
        url: `${base}${feedCategoryPath(locale, category)}`,
        lastModified: now,
        changeFrequency: "hourly",
        priority: priority * 0.8,
      });
    }
  }

  const articles = await fetchAllSitemapArticles();

  for (const article of articles) {
    for (const locale of locales) {
      if (
        !isArticleAccessibleForLocale(
          { sourceSlug: article.sourceSlug, languageCode: article.languageCode },
          locale,
        )
      ) {
        continue;
      }

      entries.push({
        url: `${base}${articleDetailPath(locale, article.slug)}`,
        lastModified: new Date(article.publishedAt),
        changeFrequency: "daily",
        priority: localePriority(locale) * 0.7,
      });
    }
  }

  return entries;
}

export function buildNewsSitemapXml(
  articles: ReadonlyArray<{
    slug: string;
    title: string;
    publishedAt: string;
    languageCode: string;
  }>,
  siteUrl: string,
): string {
  const base = siteUrl.replace(/\/$/, "");
  const publicationName = "Veraz";
  const language = "es";

  const urls = articles
    .filter((article) => article.languageCode === "es" || article.languageCode.startsWith("es"))
    .map((article) => {
      const loc = `${base}/es/noticias/${encodeURIComponent(article.slug)}`;
      const pubDate = new Date(article.publishedAt).toISOString();

      return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(publicationName)}</news:name>
        <news:language>${language}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}
</urlset>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

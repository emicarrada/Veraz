import { getAppConfig } from "@/config";
import { isArticleAccessibleForLocale } from "@/features/news/config/prestigious-sources";
import { createContentRepositories } from "@/lib/repositories/factory";
import { articleDetailPath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";
import { locales } from "@/i18n/routing";

const OUTBOUND_RSS_LIMIT = 50;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function buildOutboundRssFeed(locale: Locale): Promise<string> {
  const { siteUrl, name, tagline } = getAppConfig();
  const base = siteUrl.replace(/\/$/, "");
  const repos = createContentRepositories();

  const items: string[] = [];

  if (repos) {
    const page = await repos.articleRepository.listPublishedForSitemap({
      limit: OUTBOUND_RSS_LIMIT,
    });

    for (const record of page.items) {
      if (
        !isArticleAccessibleForLocale(
          { sourceSlug: record.sourceSlug, languageCode: record.languageCode },
          locale,
        )
      ) {
        continue;
      }

      const link = `${base}${articleDetailPath(locale, record.slug)}`;
      const pubDate = new Date(record.publishedAt).toUTCString();

      items.push(`
    <item>
      <title>${escapeXml(record.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(record.categorySlug)}</category>
    </item>`);
    }
  }

  const feedLink = `${base}/${locale}/noticias/feed.xml`;
  const selfLink = feedLink;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(name)} — ${escapeXml(tagline)}</title>
    <link>${base}/${locale}/noticias</link>
    <description>${escapeXml(`Noticias curadas con trazabilidad a fuentes originales (${locale.toUpperCase()}).`)}</description>
    <language>${locale === "en" ? "en-us" : "es-mx"}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(selfLink)}" rel="self" type="application/rss+xml" />${items.join("")}
  </channel>
</rss>`;
}

export function outboundRssLocales(): readonly Locale[] {
  return locales;
}

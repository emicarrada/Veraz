import type { NewsTopicGroup } from "@/features/news/classification/categories";
import { isNewsTopicGroup } from "@/features/news/classification/categories";
import type { RssFeedConfig } from "@/config/domains/news";

export type RssFeedVertical = "finance" | "tech" | "general";

export type RssFeedCatalogEntry = RssFeedConfig & {
  /** Editorial vertical for docs and UI grouping. */
  primaryVertical: RssFeedVertical;
  /** Human-readable source name for documentation. */
  label: string;
  /** Optional editorial notes (trust, coverage, caveats). */
  notes?: string;
};

/**
 * Curated RSS catalog — global mix (ES + EN), section feeds preferred over homepages.
 * Used by smoke tests and documented in docs/news-sources.md.
 * Runtime ingestion still reads NEWS_RSS_FEEDS from env (copy entries from here).
 */
export const RSS_FEED_CATALOG: readonly RssFeedCatalogEntry[] = [
  // ——— Finanzas ———
  {
    sourceSlug: "cnbc-top",
    feedUrl:
      "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664",
    defaultLanguageCode: "en",
    defaultTopicGroup: "economia",
    primaryVertical: "finance",
    label: "CNBC Top News",
    notes: "Mercados USA y macro global.",
  },
  {
    sourceSlug: "marketwatch",
    feedUrl: "https://www.marketwatch.com/rss/topstories",
    defaultLanguageCode: "en",
    defaultTopicGroup: "economia",
    primaryVertical: "finance",
    label: "MarketWatch",
  },
  {
    sourceSlug: "bloomberg-linea",
    feedUrl: "https://www.bloomberglinea.com/arc/outboundfeeds/rss/?outputType=xml",
    defaultLanguageCode: "es",
    defaultTopicGroup: "economia",
    primaryVertical: "finance",
    label: "Bloomberg Línea",
    notes: "Finanzas LATAM.",
  },
  {
    sourceSlug: "expansion",
    feedUrl: "https://www.expansion.com/rss/portada.xml",
    defaultLanguageCode: "es",
    defaultTopicGroup: "economia",
    primaryVertical: "finance",
    label: "Expansión",
    notes: "Economía y empresas (España).",
  },
  {
    sourceSlug: "el-pais-economia",
    feedUrl:
      "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada",
    defaultLanguageCode: "es",
    defaultTopicGroup: "economia",
    primaryVertical: "finance",
    label: "El País Economía",
  },
  // ——— Tecnología (referencia global) ———
  {
    sourceSlug: "techcrunch",
    feedUrl: "https://techcrunch.com/feed/",
    defaultLanguageCode: "en",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    label: "TechCrunch",
  },
  {
    sourceSlug: "the-verge",
    feedUrl: "https://www.theverge.com/rss/index.xml",
    defaultLanguageCode: "en",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    label: "The Verge",
  },
  {
    sourceSlug: "ars-technica",
    feedUrl: "https://feeds.arstechnica.com/arstechnica/index",
    defaultLanguageCode: "en",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    label: "Ars Technica",
  },
  {
    sourceSlug: "wired",
    feedUrl: "https://www.wired.com/feed/rss",
    defaultLanguageCode: "en",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    label: "Wired",
  },
  {
    sourceSlug: "mit-tech-review",
    feedUrl: "https://www.technologyreview.com/feed/",
    defaultLanguageCode: "en",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    label: "MIT Technology Review",
  },
  {
    sourceSlug: "engadget",
    feedUrl: "https://www.engadget.com/rss.xml",
    defaultLanguageCode: "en",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    label: "Engadget",
  },
  {
    sourceSlug: "el-pais-tecnologia",
    feedUrl:
      "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/tecnologia/portada",
    defaultLanguageCode: "es",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    label: "El País Tecnología",
  },
  // ——— General (ES/LATAM — solo en pestaña Todas, no en Finanzas/Tecnología) ———
  {
    sourceSlug: "bbc-mundo",
    feedUrl: "https://feeds.bbci.co.uk/mundo/rss.xml",
    defaultLanguageCode: "es",
    primaryVertical: "general",
    label: "BBC Mundo",
  },
  {
    sourceSlug: "el-pais",
    feedUrl: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada",
    defaultLanguageCode: "es",
    primaryVertical: "general",
    label: "El País",
  },
  {
    sourceSlug: "infobae",
    feedUrl: "https://www.infobae.com/arc/outboundfeeds/rss/?outputType=xml",
    defaultLanguageCode: "es",
    primaryVertical: "general",
    label: "Infobae",
  },
  {
    sourceSlug: "la-nacion",
    feedUrl: "https://www.lanacion.com.ar/arc/outboundfeeds/rss/?outputType=xml",
    defaultLanguageCode: "es",
    primaryVertical: "general",
    label: "La Nación",
  },
] as const;

/** Strip catalog-only fields for NEWS_RSS_FEEDS JSON. */
export function toRssFeedConfig(entry: RssFeedCatalogEntry): RssFeedConfig {
  return {
    sourceSlug: entry.sourceSlug,
    feedUrl: entry.feedUrl,
    ...(entry.defaultLanguageCode ? { defaultLanguageCode: entry.defaultLanguageCode } : {}),
    ...(entry.defaultTopicGroup ? { defaultTopicGroup: entry.defaultTopicGroup } : {}),
    ...(entry.primaryVertical ? { primaryVertical: entry.primaryVertical } : {}),
  };
}

export function getCatalogFeedsByVertical(
  vertical: RssFeedVertical,
): ReadonlyArray<RssFeedCatalogEntry> {
  return RSS_FEED_CATALOG.filter((entry) => entry.primaryVertical === vertical);
}

/** Full catalog serialized for NEWS_RSS_FEEDS env var. */
export function getRssFeedCatalogJson(): string {
  return JSON.stringify(RSS_FEED_CATALOG.map(toRssFeedConfig));
}

export { isNewsTopicGroup };

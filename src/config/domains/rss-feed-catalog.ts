import type { NewsTopicGroup } from "@/features/news/classification/categories";
import { isNewsTopicGroup } from "@/features/news/classification/categories";
import type { RssFeedConfig } from "@/config/domains/news";

export type RssFeedVertical = "finance" | "tech" | "sports" | "culture" | "general";

export type RssFeedCatalogEntry = RssFeedConfig & {
  /** Editorial vertical for docs and UI grouping. */
  primaryVertical: RssFeedVertical;
  /** ISO 3166-1 alpha-2 when the outlet belongs to one country. */
  countryCode?: string;
  /** Human-readable source name for documentation. */
  label: string;
  /** Optional editorial notes (trust, coverage, caveats). */
  notes?: string;
};

/**
 * Curated RSS catalog — global mix (ES + EN), section feeds preferred over homepages.
 * Used by smoke tests and documented in docs/news-sources.md.
 * Ingestion unions this catalog with NEWS_RSS_FEEDS: env wins per slug, catalog fills the rest.
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
    countryCode: "US",
    label: "CNBC Top News",
    notes: "Mercados USA y macro global.",
  },
  {
    sourceSlug: "marketwatch",
    feedUrl: "https://www.marketwatch.com/rss/topstories",
    defaultLanguageCode: "en",
    defaultTopicGroup: "economia",
    primaryVertical: "finance",
    countryCode: "US",
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
    countryCode: "ES",
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
    countryCode: "ES",
    label: "El País Economía",
  },
  // ——— Tecnología (referencia global) ———
  {
    sourceSlug: "techcrunch",
    feedUrl: "https://techcrunch.com/feed/",
    defaultLanguageCode: "en",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    countryCode: "US",
    label: "TechCrunch",
  },
  {
    sourceSlug: "the-verge",
    feedUrl: "https://www.theverge.com/rss/index.xml",
    defaultLanguageCode: "en",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    countryCode: "US",
    label: "The Verge",
  },
  {
    sourceSlug: "ars-technica",
    feedUrl: "https://feeds.arstechnica.com/arstechnica/index",
    defaultLanguageCode: "en",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    countryCode: "US",
    label: "Ars Technica",
  },
  {
    sourceSlug: "wired",
    feedUrl: "https://www.wired.com/feed/rss",
    defaultLanguageCode: "en",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    countryCode: "US",
    label: "Wired",
  },
  {
    sourceSlug: "mit-tech-review",
    feedUrl: "https://www.technologyreview.com/feed/",
    defaultLanguageCode: "en",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    countryCode: "US",
    label: "MIT Technology Review",
  },
  {
    sourceSlug: "engadget",
    feedUrl: "https://www.engadget.com/rss.xml",
    defaultLanguageCode: "en",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    countryCode: "US",
    label: "Engadget",
  },
  {
    sourceSlug: "el-pais-tecnologia",
    feedUrl:
      "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/tecnologia/portada",
    defaultLanguageCode: "es",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    countryCode: "ES",
    label: "El País Tecnología",
  },
  // ——— Sports (EN — /en deportes) ———
  {
    sourceSlug: "bbc-sport",
    feedUrl: "https://feeds.bbci.co.uk/sport/rss.xml",
    defaultLanguageCode: "en",
    defaultTopicGroup: "deportes",
    primaryVertical: "sports",
    countryCode: "GB",
    label: "BBC Sport",
    notes: "Global sports coverage, editorial tone.",
  },
  {
    sourceSlug: "guardian-sport",
    feedUrl: "https://www.theguardian.com/sport/rss",
    defaultLanguageCode: "en",
    defaultTopicGroup: "deportes",
    primaryVertical: "sports",
    countryCode: "GB",
    label: "The Guardian Sport",
  },
  {
    sourceSlug: "espn-top",
    feedUrl: "https://www.espn.com/espn/rss/news",
    defaultLanguageCode: "en",
    defaultTopicGroup: "deportes",
    primaryVertical: "sports",
    countryCode: "US",
    label: "ESPN Top Headlines",
    notes: "USA-centric; low item count in RSS — monitor in feeds:validate.",
  },
  // ——— Culture / entertainment (EN — /en cultura) ———
  {
    sourceSlug: "bbc-entertainment",
    feedUrl: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
    defaultLanguageCode: "en",
    defaultTopicGroup: "cultura",
    primaryVertical: "culture",
    countryCode: "GB",
    label: "BBC Entertainment & Arts",
  },
  {
    sourceSlug: "guardian-culture",
    feedUrl: "https://www.theguardian.com/culture/rss",
    defaultLanguageCode: "en",
    defaultTopicGroup: "cultura",
    primaryVertical: "culture",
    countryCode: "GB",
    label: "The Guardian Culture",
  },
  {
    sourceSlug: "variety",
    feedUrl: "https://variety.com/feed/",
    defaultLanguageCode: "en",
    defaultTopicGroup: "cultura",
    primaryVertical: "culture",
    countryCode: "US",
    label: "Variety",
    notes: "Entertainment industry; film/TV business.",
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
    countryCode: "ES",
    label: "El País",
  },
  {
    sourceSlug: "la-nacion",
    feedUrl: "https://www.lanacion.com.ar/arc/outboundfeeds/rss/?outputType=xml",
    defaultLanguageCode: "es",
    primaryVertical: "general",
    countryCode: "AR",
    label: "La Nación",
  },
  // ——— México (feed principal: cultura de aquí, luego el resto del país) ———
  {
    sourceSlug: "la-jornada",
    feedUrl: "https://www.jornada.com.mx/rss/edicion.xml",
    defaultLanguageCode: "es",
    primaryVertical: "general",
    countryCode: "MX",
    label: "La Jornada",
  },
  {
    sourceSlug: "la-jornada-cultura",
    feedUrl: "https://www.jornada.com.mx/rss/cultura.xml",
    defaultLanguageCode: "es",
    defaultTopicGroup: "cultura",
    primaryVertical: "culture",
    countryCode: "MX",
    label: "La Jornada Cultura",
  },
  {
    sourceSlug: "la-jornada-espectaculos",
    feedUrl: "https://www.jornada.com.mx/rss/espectaculos.xml",
    defaultLanguageCode: "es",
    defaultTopicGroup: "cultura",
    primaryVertical: "culture",
    countryCode: "MX",
    label: "La Jornada Espectáculos",
  },
  {
    sourceSlug: "la-jornada-deportes",
    feedUrl: "https://www.jornada.com.mx/rss/deportes.xml",
    defaultLanguageCode: "es",
    defaultTopicGroup: "deportes",
    primaryVertical: "sports",
    countryCode: "MX",
    label: "La Jornada Deportes",
  },
  {
    sourceSlug: "espn-mx",
    feedUrl: "https://www.espn.com.mx/espn/rss/news",
    defaultLanguageCode: "es",
    defaultTopicGroup: "deportes",
    primaryVertical: "sports",
    countryCode: "MX",
    label: "ESPN México",
    notes: "Portada deportiva en español. ESPN en inglés sigue en espn-top.",
  },
  {
    sourceSlug: "record-mx",
    feedUrl: "https://www.record.com.mx/rss",
    defaultLanguageCode: "es",
    defaultTopicGroup: "deportes",
    primaryVertical: "sports",
    countryCode: "MX",
    label: "Récord",
  },
  {
    sourceSlug: "marca",
    feedUrl: "https://www.marca.com/rss/portada.xml",
    defaultLanguageCode: "es",
    defaultTopicGroup: "deportes",
    primaryVertical: "sports",
    countryCode: "ES",
    label: "Marca",
  },
  {
    sourceSlug: "reforma",
    feedUrl: "https://www.reforma.com/rss/portada.xml",
    defaultLanguageCode: "es",
    primaryVertical: "general",
    countryCode: "MX",
    label: "Reforma",
  },
  {
    sourceSlug: "reforma-cultura",
    feedUrl: "https://www.reforma.com/rss/cultura.xml",
    defaultLanguageCode: "es",
    defaultTopicGroup: "cultura",
    primaryVertical: "culture",
    countryCode: "MX",
    label: "Reforma Cultura",
  },
  {
    sourceSlug: "el-economista",
    feedUrl: "https://www.eleconomista.com.mx/rss/ultimas-noticias",
    defaultLanguageCode: "es",
    defaultTopicGroup: "economia",
    primaryVertical: "finance",
    countryCode: "MX",
    label: "El Economista",
    notes: "Economía de México.",
  },
  {
    sourceSlug: "xataka-mx",
    feedUrl: "https://www.xataka.com.mx/index.xml",
    defaultLanguageCode: "es",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    countryCode: "MX",
    label: "Xataka México",
    notes: "Cultura digital en México. Entra en Todas, no en la pestaña Tecnología de referencia.",
  },
  {
    sourceSlug: "xataka",
    feedUrl: "https://www.xataka.com/index.xml",
    defaultLanguageCode: "es",
    defaultTopicGroup: "tecnologia",
    primaryVertical: "tech",
    countryCode: "ES",
    label: "Xataka",
    notes: "Cultura digital en español. Entra en Todas, no en la pestaña Tecnología de referencia.",
  },
  {
    sourceSlug: "chilango",
    feedUrl: "https://www.chilango.com/feed/",
    defaultLanguageCode: "es",
    defaultTopicGroup: "cultura",
    primaryVertical: "culture",
    countryCode: "MX",
    label: "Chilango",
  },
  {
    sourceSlug: "sopitas",
    feedUrl: "https://www.sopitas.com/feed/",
    defaultLanguageCode: "es",
    defaultTopicGroup: "cultura",
    primaryVertical: "culture",
    countryCode: "MX",
    label: "Sopitas",
  },
] as const;

const BLOCKED_NEWS_SOURCE_SLUGS = new Set(["infobae"]);
const BLOCKED_NEWS_HOSTS = ["infobae.com"] as const;

export function isBlockedNewsSourceSlug(slug: string): boolean {
  return BLOCKED_NEWS_SOURCE_SLUGS.has(slug.trim().toLowerCase());
}

export function isBlockedNewsHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  return BLOCKED_NEWS_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
}

/** Hard-block leftover env entries (slug or infobae.com host). */
export function isBlockedRssFeed(feed: { sourceSlug: string; feedUrl: string }): boolean {
  if (isBlockedNewsSourceSlug(feed.sourceSlug)) return true;
  try {
    return isBlockedNewsHost(new URL(feed.feedUrl).hostname);
  } catch {
    return false;
  }
}

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

export function catalogLabelForSlug(sourceSlug: string): string | undefined {
  return RSS_FEED_CATALOG.find((entry) => entry.sourceSlug === sourceSlug)?.label;
}

export function sourceSlugsForCountry(countryCode: string): readonly string[] {
  const code = countryCode.trim().toUpperCase();
  return RSS_FEED_CATALOG.filter((entry) => entry.countryCode === code).map(
    (entry) => entry.sourceSlug,
  );
}

/** Sports desks for a locale. The deportes tab reads only these slugs. */
export function sportsSourceSlugs(languageCode: "es" | "en"): readonly string[] {
  return RSS_FEED_CATALOG.filter(
    (entry) =>
      entry.primaryVertical === "sports" && entry.defaultLanguageCode === languageCode,
  ).map((entry) => entry.sourceSlug);
}

/**
 * Env feeds stay as configured. Catalog slugs missing from env are appended
 * so a stale NEWS_RSS_FEEDS secret still ingests new sports desks.
 */
export function mergeRssFeedsWithCatalog(
  fromEnv: readonly RssFeedConfig[],
): RssFeedConfig[] {
  const bySlug = new Map<string, RssFeedConfig>();
  for (const feed of fromEnv) {
    if (!isBlockedRssFeed(feed)) bySlug.set(feed.sourceSlug, feed);
  }
  for (const entry of RSS_FEED_CATALOG) {
    const feed = toRssFeedConfig(entry);
    if (isBlockedRssFeed(feed) || bySlug.has(feed.sourceSlug)) continue;
    bySlug.set(feed.sourceSlug, feed);
  }
  return [...bySlug.values()];
}

export function cultureSourceSlugsForCountry(countryCode: string): readonly string[] {
  const code = countryCode.trim().toUpperCase();
  return RSS_FEED_CATALOG.filter(
    (entry) => entry.countryCode === code && entry.primaryVertical === "culture",
  ).map((entry) => entry.sourceSlug);
}

/** Full catalog serialized for NEWS_RSS_FEEDS env var. */
export function getRssFeedCatalogJson(): string {
  return JSON.stringify(RSS_FEED_CATALOG.map(toRssFeedConfig));
}

export { isNewsTopicGroup };

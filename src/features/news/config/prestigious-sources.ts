import { RSS_FEED_CATALOG } from "@/config/domains/rss-feed-catalog";
import {
  getTopicGroup,
  type NewsTopicGroup,
  type NewsTopicSlug,
} from "@/features/news/classification/categories";
import type { Locale } from "@/i18n/routing";

export type PrestigiousSource = {
  slug: string;
  label: string;
};

/** Spanish-language prestigious finance outlets (shown on /es). */
export const PRESTIGIOUS_FINANCE_SOURCES_ES: readonly PrestigiousSource[] = [
  { slug: "bloomberg-linea", label: "Bloomberg Línea" },
  { slug: "expansion", label: "Expansión" },
  { slug: "el-pais-economia", label: "El País Economía" },
];

/** English-language prestigious finance outlets (shown on /en). */
export const PRESTIGIOUS_FINANCE_SOURCES_EN: readonly PrestigiousSource[] = [
  { slug: "cnbc-top", label: "CNBC" },
  { slug: "marketwatch", label: "MarketWatch" },
];

/** Spanish-language prestigious tech outlets (shown on /es). */
export const PRESTIGIOUS_TECH_SOURCES_ES: readonly PrestigiousSource[] = [
  { slug: "el-pais-tecnologia", label: "El País Tecnología" },
];

/** English-language prestigious tech outlets (shown on /en). */
export const PRESTIGIOUS_TECH_SOURCES_EN: readonly PrestigiousSource[] = [
  { slug: "techcrunch", label: "TechCrunch" },
  { slug: "the-verge", label: "The Verge" },
  { slug: "ars-technica", label: "Ars Technica" },
  { slug: "wired", label: "Wired" },
  { slug: "mit-tech-review", label: "MIT Technology Review" },
  { slug: "engadget", label: "Engadget" },
];

/** Mixed ES+EN finance sources for /es prestigious tabs. */
export const PRESTIGIOUS_FINANCE_SOURCES: readonly PrestigiousSource[] = [
  ...PRESTIGIOUS_FINANCE_SOURCES_EN,
  ...PRESTIGIOUS_FINANCE_SOURCES_ES,
];

/** Mixed ES+EN tech sources for /es prestigious tabs. */
export const PRESTIGIOUS_TECH_SOURCES: readonly PrestigiousSource[] = [
  ...PRESTIGIOUS_TECH_SOURCES_EN,
  ...PRESTIGIOUS_TECH_SOURCES_ES,
];

const PRESTIGIOUS_BY_GROUP_ES: Record<"economia" | "tecnologia", readonly PrestigiousSource[]> = {
  economia: PRESTIGIOUS_FINANCE_SOURCES,
  tecnologia: PRESTIGIOUS_TECH_SOURCES,
};

const PRESTIGIOUS_BY_GROUP_EN: Record<"economia" | "tecnologia", readonly PrestigiousSource[]> = {
  economia: PRESTIGIOUS_FINANCE_SOURCES_EN,
  tecnologia: PRESTIGIOUS_TECH_SOURCES_EN,
};

export function isPrestigiousFeedGroup(
  group: NewsTopicGroup | undefined,
): group is "economia" | "tecnologia" {
  return group === "economia" || group === "tecnologia";
}

export function getPrestigiousSourcesForGroup(
  group: "economia" | "tecnologia",
  locale: Locale = "es",
): readonly PrestigiousSource[] {
  const byGroup = locale === "en" ? PRESTIGIOUS_BY_GROUP_EN : PRESTIGIOUS_BY_GROUP_ES;
  return byGroup[group];
}

export function getPrestigiousSourcesForCategory(
  categorySlug?: NewsTopicSlug,
  locale: Locale = "es",
): readonly PrestigiousSource[] | undefined {
  if (!categorySlug) return undefined;
  const group = getTopicGroup(categorySlug);
  if (!isPrestigiousFeedGroup(group)) return undefined;
  return getPrestigiousSourcesForGroup(group, locale);
}

export function getPrestigiousSourceSlugsForCategory(
  categorySlug?: NewsTopicSlug,
  locale: Locale = "es",
): readonly string[] | undefined {
  const sources = getPrestigiousSourcesForCategory(categorySlug, locale);
  return sources?.map((source) => source.slug);
}

/**
 * Prestigious tabs curate by source. Broad tabs (Finanzas/Tecnología) show all items
 * from those outlets; sub-tags (mercados, openai, …) also apply category filter.
 */
export function resolvePrestigiousFeedQuery(
  categorySlug?: NewsTopicSlug,
  locale: Locale = "es",
): {
  categorySlug?: NewsTopicSlug;
  sourceSlugs?: readonly string[];
} {
  const sourceSlugs = getPrestigiousSourceSlugsForCategory(categorySlug, locale);
  if (!sourceSlugs?.length || !categorySlug) {
    return { ...(categorySlug ? { categorySlug } : {}) };
  }

  const group = getTopicGroup(categorySlug);
  if (categorySlug === group) {
    return { sourceSlugs };
  }

  return { categorySlug, sourceSlugs };
}

export function formatPrestigiousSourceLabels(
  sources: readonly PrestigiousSource[],
): string {
  return sources.map((source) => source.label).join(" · ");
}

/** @deprecated Use feed message keys in messages/{locale}.json */
export function getPrestigiousFeedTrustIntro(
  group: "economia" | "tecnologia",
): string {
  const labels = formatPrestigiousSourceLabels(getPrestigiousSourcesForGroup(group, "es"));
  if (group === "economia") {
    return (
      `Solo noticias de medios de referencia en finanzas y mercados (${labels}). ` +
      `Cada titular enlaza a la fuente original; Veraz no altera ni inventa hechos.`
    );
  }

  return (
    `Solo noticias de medios tecnológicos de referencia global (${labels}). ` +
    `Cada titular enlaza a la fuente original; Veraz no altera ni inventa hechos.`
  );
}

/** English catalog sources — whitelist for /en feed (blocks Clarín, Infobae, etc.). */
export const EN_FEED_SOURCE_SLUGS: readonly string[] = RSS_FEED_CATALOG.filter(
  (entry) => entry.defaultLanguageCode === "en",
).map((entry) => entry.sourceSlug);

/** Spanish catalog sources — whitelist for /es feed (except prestigious finance/tech mix). */
export const ES_FEED_SOURCE_SLUGS: readonly string[] = RSS_FEED_CATALOG.filter(
  (entry) => entry.defaultLanguageCode === "es",
).map((entry) => entry.sourceSlug);

/** EN reference outlets allowed on /es Finanzas and Tecnología tabs. */
export const PRESTIGIOUS_EN_REFERENCE_SOURCE_SLUGS: readonly string[] = [
  ...PRESTIGIOUS_FINANCE_SOURCES_EN,
  ...PRESTIGIOUS_TECH_SOURCES_EN,
].map((source) => source.slug);

/** @deprecated Use ES_FEED_SOURCE_SLUGS whitelist via resolveFeedSourceSlugs */
export const SPANISH_MEDIA_SOURCE_SLUGS: readonly string[] = ES_FEED_SOURCE_SLUGS;

export type ArticleLocaleAccess = {
  sourceSlug: string;
  languageCode: string;
};

function normalizeLanguageCode(code: string): string {
  return code.trim().toLowerCase().split("-")[0] ?? code;
}

function isPrestigiousMixedTab(categorySlug?: NewsTopicSlug): boolean {
  if (!categorySlug) return false;
  const group = getTopicGroup(categorySlug);
  return isPrestigiousFeedGroup(group) && categorySlug === group;
}

/**
 * Feed language filter:
 * /en → English only; /es → Spanish only except Finanzas/Tecnología (mixed EN+ES sources).
 */
export function resolveFeedLanguageCodes(
  locale: Locale,
  categorySlug?: NewsTopicSlug,
): readonly string[] | undefined {
  if (locale === "en") return ["en"];
  if (locale === "es" && isPrestigiousMixedTab(categorySlug)) return undefined;
  if (locale === "es") return ["es"];
  return undefined;
}

/**
 * Source filter for feed queries.
 * /en: EN catalog whitelist (or prestigious subset when tab applies).
 * /es: ES catalog whitelist, or mixed prestigious sources on Finanzas/Tecnología.
 */
export function resolveFeedSourceSlugs(
  locale: Locale,
  prestigiousSourceSlugs?: readonly string[],
): readonly string[] | undefined {
  if (prestigiousSourceSlugs?.length) return prestigiousSourceSlugs;
  if (locale === "en") return EN_FEED_SOURCE_SLUGS;
  if (locale === "es") return ES_FEED_SOURCE_SLUGS;
  return undefined;
}

/** Whether an article may be viewed under the given UI locale. */
export function isArticleAccessibleForLocale(
  article: ArticleLocaleAccess,
  locale: Locale,
): boolean {
  const languageCode = normalizeLanguageCode(article.languageCode);

  if (locale === "en") {
    return EN_FEED_SOURCE_SLUGS.includes(article.sourceSlug) && languageCode === "en";
  }

  if (ES_FEED_SOURCE_SLUGS.includes(article.sourceSlug) && languageCode === "es") {
    return true;
  }

  return PRESTIGIOUS_EN_REFERENCE_SOURCE_SLUGS.includes(article.sourceSlug);
}

/** @deprecated Use resolveFeedSourceSlugs */
export function resolveFeedExcludeSourceSlugs(
  locale: Locale,
): readonly string[] | undefined {
  if (locale === "en") return SPANISH_MEDIA_SOURCE_SLUGS;
  return undefined;
}

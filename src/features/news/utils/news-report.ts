import { RSS_FEED_CATALOG } from "@/config/domains/rss-feed-catalog";

/**
 * Outlets mix news reports with opinion, lifestyle, how-tos and sponsored
 * pieces. The path section is how those desks label the difference.
 * Culture verticals are magazines, not the news recap.
 */

const CULTURE_OUTLETS = new Set(
  RSS_FEED_CATALOG.filter((entry) => entry.primaryVertical === "culture").map(
    (entry) => entry.sourceSlug,
  ),
);

export function isNewsOutlet(sourceSlug: string): boolean {
  return !CULTURE_OUTLETS.has(sourceSlug);
}

const NON_NEWS_SECTIONS = new Set([
  "opinion",
  "opiniones",
  "op-ed",
  "blog",
  "blogs",
  "columna",
  "columnas",
  "columnistas",
  "lifestyle",
  "recetas",
  "arteseideas",
  "espectaculos",
  "farandula",
  "feature",
  "features",
  "finanzaspersonales",
  "capital-humano",
  "el-empresario",
  "seleccion",
  "branded",
  "patrocinados",
  "publirreportaje",
]);

function foldSection(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** True when the canonical URL is a news report, not an article or opinion piece. */
export function isNewsReportUrl(url: string): boolean {
  let pathname = "";
  try {
    pathname = new URL(url).pathname;
  } catch {
    return false;
  }

  const sections = pathname.split("/").filter(Boolean).map(foldSection);
  return !sections.some(
    (section) => NON_NEWS_SECTIONS.has(section) || section.startsWith("territorio-"),
  );
}

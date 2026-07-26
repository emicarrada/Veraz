import type { NewsCategorySlug } from "@/features/news/classification/categories";
import type { SocialArticleCandidate } from "@/features/social-publishing/types";

const CATEGORY_QUERY: Partial<Record<NewsCategorySlug, string>> = {
  deportes: "sports action stadium",
  futbol: "soccer football match",
  nba: "basketball arena",
  cultura: "culture city lights art",
  internacional: "world news city skyline",
  sociedad: "people city street",
  politica: "government building press",
  economia: "business finance city",
  mercados: "stock market trading",
  tecnologia: "technology digital abstract",
  "inteligencia-artificial": "artificial intelligence technology",
  general: "news city aerial",
};

const TITLE_HINTS: [RegExp, string][] = [
  [/incendio|fuego|wildfire|fire/i, "fire smoke emergency"],
  [/sismo|terremoto|earthquake/i, "earthquake city"],
  [/inundaci|lluvia|tormenta|hurac/i, "storm rain flood"],
  [/guerra|conflicto|militar/i, "conflict news"],
  [/video|imágenes|footage/i, "news broadcast"],
];

function significantTitleWords(title: string, maxWords: number): string[] {
  const stop = new Set([
    "el",
    "la",
    "los",
    "las",
    "un",
    "una",
    "de",
    "del",
    "en",
    "y",
    "a",
    "que",
    "por",
    "con",
    "para",
    "al",
    "se",
    "su",
    "es",
    "the",
    "and",
    "for",
  ]);
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stop.has(w))
    .slice(0, maxWords);
}

/** Search query for stock video (Pexels etc.) — English works best on stock sites. */
export function buildStockVideoSearchQuery(candidate: SocialArticleCandidate): string {
  for (const [pattern, hint] of TITLE_HINTS) {
    if (pattern.test(candidate.title)) return hint;
  }

  const fromCategory = CATEGORY_QUERY[candidate.categorySlug] ?? CATEGORY_QUERY.general ?? "news";
  const fromTitle = significantTitleWords(candidate.title, 2).join(" ");
  return fromTitle ? `${fromTitle} ${fromCategory}` : fromCategory;
}

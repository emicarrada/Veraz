import type { NewsCategorySlug } from "@/features/news/classification/categories";
import type { SocialArticleCandidate } from "@/features/social-publishing/types";

/** One-word hints for TikTok sound search — Spanish-friendly. */
const CATEGORY_KEYWORD: Partial<Record<NewsCategorySlug, string>> = {
  deportes: "deportes",
  futbol: "fútbol",
  nba: "basketball",
  cultura: "cultura",
  internacional: "mundo",
  sociedad: "sociedad",
  politica: "política",
  economia: "economía",
  mercados: "mercados",
  tecnologia: "tecnología",
  "inteligencia-artificial": "tecnología",
  general: "noticias",
};

const TITLE_HINTS: [RegExp, string][] = [
  [/incendio|fuego/i, "emergencia"],
  [/sismo|terremoto/i, "noticias"],
  [/guerra|conflicto|militar/i, "guerra"],
  [/elecci|votaci|congreso|senado|presidente/i, "política"],
  [/fútbol|futbol|gol|liga|champions/i, "fútbol"],
  [/nba|baloncesto|basket/i, "basketball"],
];

const STOP = new Set([
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
  "new",
  "nuevo",
  "nueva",
  "says",
  "dice",
]);

function significantKeywordFromTitle(title: string): string | null {
  const words = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP.has(w));

  if (words.length === 0) return null;

  words.sort((a, b) => b.length - a.length);
  return words[0] ?? null;
}

/** Single keyword for TikTok Studio sound search, derived from the article. */
export function buildTikTokSoundSearchKeyword(candidate: SocialArticleCandidate): string {
  for (const [pattern, keyword] of TITLE_HINTS) {
    if (pattern.test(candidate.title)) return keyword;
  }

  const fromTitle = significantKeywordFromTitle(candidate.title);
  if (fromTitle && fromTitle.length >= 5) {
    return fromTitle.slice(0, 32);
  }

  const fromCategory = CATEGORY_KEYWORD[candidate.categorySlug] ?? CATEGORY_KEYWORD.general ?? "noticias";
  if (fromTitle) {
    return fromTitle.slice(0, 32);
  }

  return fromCategory;
}

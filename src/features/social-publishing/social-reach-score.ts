import type { NewsCategorySlug } from "@/features/news/classification/categories";
import type { SocialArticleCandidate } from "@/features/social-publishing/types";

const CATEGORY_WEIGHT: Partial<Record<NewsCategorySlug, number>> = {
  futbol: 3,
  messi: 3,
  ronaldo: 3,
  nba: 3,
  deportes: 2,
  rugby: 2,
  internacional: 3,
  trump: 3,
  tecnologia: 2,
  openai: 2,
  google: 2,
  "inteligencia-artificial": 2,
  economia: 2,
  mercados: 2,
  criptomonedas: 2,
  sociedad: 1,
  cultura: 1,
  politica: 1,
  sheinbaum: 1,
  unam: 1,
  general: 0,
};

/** Topics that justify local/geo headlines (no local penalty). */
const LOCAL_OK_CATEGORIES = new Set<NewsCategorySlug>([
  "internacional",
  "trump",
  "economia",
  "mercados",
  "criptomonedas",
]);

const CRIME_OR_BREAKING_TITLE =
  /femicidio|asesinato|secuestro|incendio|terremoto|atentado|explosi[oó]n|accidente|muert|heridos|detenid|imputad|crisis|guerra|conflicto|última hora|ultima hora|breaking|alerta/i;

const TITLE_HOOK =
  /última hora|ultima hora|\?|¿|…|\.\.\.|:/i;

const LOCAL_TOPONYM_TITLE =
  /\b(bolivia|santa cruz|cochabamba|la paz|oruro|potos[ií]|sucre|tarija|beni|pando|chubut|misiones|formosa|jujuy|salta|tucum[aá]n|mendoza|neuqu[eé]n|municipio|intendente|gobernador|diputad|concejo municipal|barrio)\b/i;

const DEFAULT_TIER1_SOURCES = [
  "infobae",
  "la-nacion",
  "el-pais",
  "bbc-mundo",
  "expansion",
  "bloomberg-linea",
];

export type SocialReachScoreOptions = {
  tier1SourceSlugs?: readonly string[];
};

export function parseTier1SourceSlugs(raw: string | undefined): string[] {
  if (!raw?.trim()) return [...DEFAULT_TIER1_SOURCES];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Higher = better fit for social reach (X, IG, TikTok handoff). */
export function socialReachScore(
  candidate: SocialArticleCandidate,
  options: SocialReachScoreOptions = {},
): number {
  const tier1 = new Set(options.tier1SourceSlugs ?? DEFAULT_TIER1_SOURCES);
  let score = 0;

  score += CATEGORY_WEIGHT[candidate.categorySlug] ?? 0;

  if (candidate.heroImageUrl?.trim()) {
    score += 2;
  }

  const title = candidate.title.trim();
  const titleLen = title.length;
  if (titleLen >= 45 && titleLen <= 140) {
    score += 1;
  }
  if (TITLE_HOOK.test(title)) {
    score += 1;
  }
  if (/\d/.test(title)) {
    score += 1;
  }

  if (candidate.excerpt.trim().length >= 80) {
    score += 1;
  }

  if (tier1.has(candidate.sourceSlug.toLowerCase())) {
    score += 1;
  }

  const localInTitle = LOCAL_TOPONYM_TITLE.test(title);
  const localOk =
    LOCAL_OK_CATEGORIES.has(candidate.categorySlug) || CRIME_OR_BREAKING_TITLE.test(title);
  if (localInTitle && !localOk) {
    score -= 2;
  }

  return score;
}

export type SocialReachGateOptions = {
  minScore: number;
  requireHeroForVisual: boolean;
  tier1SourceSlugs?: readonly string[];
};

export function meetsSocialReachThreshold(
  candidate: SocialArticleCandidate,
  options: SocialReachGateOptions,
): boolean {
  const score = socialReachScore(candidate, { tier1SourceSlugs: options.tier1SourceSlugs });
  if (score < options.minScore) {
    return false;
  }
  if (options.requireHeroForVisual && !candidate.heroImageUrl?.trim()) {
    return false;
  }
  return true;
}

/** @deprecated Use socialReachScore */
export function instagramImpactScore(candidate: SocialArticleCandidate): number {
  return socialReachScore(candidate);
}

/** @deprecated Use meetsSocialReachThreshold */
export function meetsInstagramImpactThreshold(candidate: SocialArticleCandidate, minScore: number): boolean {
  return socialReachScore(candidate) >= minScore;
}

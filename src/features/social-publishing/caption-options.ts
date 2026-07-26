import type { NewsCategorySlug } from "@/features/news/classification/categories";
import type { Locale } from "@/i18n/routing";
import type { SocialPlatform } from "@/features/social-publishing/types";

export type SocialCaptionOptions = {
  locale: Locale;
  platforms: SocialPlatform[];
  globalHashtags: string[];
  includeExcerpt: boolean;
};

const CATEGORY_HASHTAGS: Partial<Record<NewsCategorySlug, string[]>> = {
  deportes: ["#Deportes"],
  futbol: ["#Fútbol", "#Deportes"],
  nba: ["#NBA", "#Deportes"],
  messi: ["#Messi", "#Fútbol"],
  ronaldo: ["#Ronaldo", "#Fútbol"],
  tecnologia: ["#Tecnología"],
  "inteligencia-artificial": ["#IA", "#Tecnología"],
  openai: ["#OpenAI", "#IA"],
  google: ["#Google", "#Tecnología"],
  mercados: ["#Mercados", "#Finanzas"],
  criptomonedas: ["#Cripto", "#Finanzas"],
  economia: ["#Economía"],
  politica: ["#Política"],
  internacional: ["#Internacional"],
  cultura: ["#Cultura"],
  sociedad: ["#Sociedad"],
};

const LOCALE_HASHTAGS: Record<Locale, string[]> = {
  es: ["#Veraz", "#Noticias"],
  en: ["#Veraz", "#News"],
};

export function resolveHashtagsForCategory(
  categorySlug: NewsCategorySlug,
  locale: Locale,
  globalHashtags: string[],
): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  const push = (tag: string) => {
    const normalized = tag.startsWith("#") ? tag : `#${tag}`;
    const key = normalized.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    ordered.push(normalized);
  };

  for (const tag of globalHashtags) push(tag);
  for (const tag of LOCALE_HASHTAGS[locale]) push(tag);
  for (const tag of CATEGORY_HASHTAGS[categorySlug] ?? []) push(tag);

  return ordered.slice(0, 8);
}

/** TikTok: fewer, discovery-focused tags (category first). */
export function resolveHashtagsForTikTok(
  categorySlug: NewsCategorySlug,
  locale: Locale,
  globalHashtags: string[],
): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  const push = (tag: string) => {
    const normalized = tag.startsWith("#") ? tag : `#${tag}`;
    const key = normalized.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    ordered.push(normalized);
  };

  for (const tag of CATEGORY_HASHTAGS[categorySlug] ?? []) push(tag);
  push("#VerazApp");
  for (const tag of LOCALE_HASHTAGS[locale]) push(tag);
  for (const tag of globalHashtags.slice(0, 2)) push(tag);

  return ordered.slice(0, 5);
}

export const PLATFORM_CHAR_LIMITS: Record<SocialPlatform, number> = {
  x: 280,
  instagram: 2200,
  tiktok: 2200,
  instagram_reels: 2200,
  youtube: 5000,
};

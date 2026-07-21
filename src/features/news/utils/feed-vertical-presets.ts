import type { NewsTopicGroup, NewsTopicSlug } from "@/features/news/classification/categories";
import { getTopicGroup } from "@/features/news/classification/categories";
import {
  getPrestigiousFeedTrustIntro,
  getPrestigiousSourcesForCategory,
  isPrestigiousFeedGroup,
} from "@/features/news/config/prestigious-sources";
import { feedPath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

export type FeedVerticalCopy = {
  categorySlug: NewsTopicGroup;
  titleKey: "finanzasTitle" | "tecnologiaTitle";
  descriptionKey: "finanzasDescription" | "tecnologiaDescription";
};

export const FEED_VERTICAL_COPY: Record<"finanzas" | "tecnologia", FeedVerticalCopy> = {
  finanzas: {
    categorySlug: "economia",
    titleKey: "finanzasTitle",
    descriptionKey: "finanzasDescription",
  },
  tecnologia: {
    categorySlug: "tecnologia",
    titleKey: "tecnologiaTitle",
    descriptionKey: "tecnologiaDescription",
  },
};

/** Feed filter URL — single route, category as query param. */
export function buildFeedCategoryHref(locale: Locale, categorySlug?: NewsTopicSlug): string {
  const base = feedPath(locale);
  if (!categorySlug) return base;
  return `${base}?categoria=${encodeURIComponent(categorySlug)}`;
}

export function resolveFeedPageTitleKey(
  categorySlug?: NewsTopicSlug,
): "title" | "finanzasTitle" | "tecnologiaTitle" | `categories.${NewsTopicSlug}` {
  if (categorySlug === "economia") return "finanzasTitle";
  if (categorySlug === "tecnologia") return "tecnologiaTitle";
  if (categorySlug) return `categories.${categorySlug}`;
  return "title";
}

export function resolveFeedPageDescriptionKey(
  categorySlug?: NewsTopicSlug,
): "defaultDescription" | "finanzasDescription" | "tecnologiaDescription" | null {
  if (!categorySlug) return "defaultDescription";

  const group = getTopicGroup(categorySlug);
  if (group === "economia") return "finanzasDescription";
  if (group === "tecnologia") return "tecnologiaDescription";
  return null;
}

/** @deprecated Prestigious intro still from config for ES; EN uses feed message keys. */
export function resolveFeedPageDescription(
  categorySlug?: NewsTopicSlug,
  baseDescription?: string,
): string {
  if (!categorySlug) return baseDescription ?? "";

  const group = getTopicGroup(categorySlug);
  if (group === "economia") return getPrestigiousFeedTrustIntro("economia");
  if (group === "tecnologia") return getPrestigiousFeedTrustIntro("tecnologia");
  return baseDescription ?? "";
}

export function resolvePrestigiousSourcesForFeed(
  categorySlug?: NewsTopicSlug,
  locale: Locale = "es",
) {
  return getPrestigiousSourcesForCategory(categorySlug, locale);
}

export function isPrestigiousFeedCategory(categorySlug?: NewsTopicSlug): boolean {
  if (!categorySlug) return false;
  return isPrestigiousFeedGroup(getTopicGroup(categorySlug));
}

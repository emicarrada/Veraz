import type { NewsTopicGroup, NewsTopicSlug } from "@/features/news/classification/categories";
import { getCategoryLabel, getTopicGroup } from "@/features/news/classification/categories";
import {
  getPrestigiousFeedTrustIntro,
  getPrestigiousSourcesForCategory,
  isPrestigiousFeedGroup,
} from "@/features/news/config/prestigious-sources";

export type FeedVerticalCopy = {
  categorySlug: NewsTopicGroup;
  title: string;
  description: string;
};

export const FEED_VERTICAL_COPY: Record<"finanzas" | "tecnologia", FeedVerticalCopy> = {
  finanzas: {
    categorySlug: "economia",
    title: "Finanzas",
    description: getPrestigiousFeedTrustIntro("economia"),
  },
  tecnologia: {
    categorySlug: "tecnologia",
    title: "Tecnología",
    description: getPrestigiousFeedTrustIntro("tecnologia"),
  },
};

/** Feed filter URL — single route, category as query param. */
export function buildFeedCategoryHref(categorySlug?: NewsTopicSlug): string {
  if (!categorySlug) return "/noticias";
  return `/noticias?categoria=${encodeURIComponent(categorySlug)}`;
}

export function resolveFeedPageTitle(categorySlug?: NewsTopicSlug): string {
  if (categorySlug === "economia") return FEED_VERTICAL_COPY.finanzas.title;
  if (categorySlug === "tecnologia") return FEED_VERTICAL_COPY.tecnologia.title;
  if (categorySlug) return getCategoryLabel(categorySlug);
  return "Noticias";
}

export function resolveFeedPageDescription(
  categorySlug?: NewsTopicSlug,
  baseDescription?: string,
): string {
  if (!categorySlug) return baseDescription ?? "";

  const group = getTopicGroup(categorySlug);
  if (group === "economia") return FEED_VERTICAL_COPY.finanzas.description;
  if (group === "tecnologia") return FEED_VERTICAL_COPY.tecnologia.description;
  return baseDescription ?? "";
}

export function resolvePrestigiousSourcesForFeed(categorySlug?: NewsTopicSlug) {
  return getPrestigiousSourcesForCategory(categorySlug);
}

export function isPrestigiousFeedCategory(categorySlug?: NewsTopicSlug): boolean {
  if (!categorySlug) return false;
  return isPrestigiousFeedGroup(getTopicGroup(categorySlug));
}

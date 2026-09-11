import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { permanentRedirect } from "next/navigation";

import { NewsFeedPage } from "@/features/news/components/news-feed-page";
import { buildFeedPageMetadata } from "@/features/seo/build-page-metadata";
import { isCategoryLandingSlug } from "@/features/seo/sitemap-urls";
import { feedCategoryPath, feedPath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

/** ISR interval — keep in sync with DEFAULT_CACHE_CONFIG.feedRevalidateSeconds */
export const revalidate = 120;

type NoticiasPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; categoria?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: NoticiasPageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = locale as Locale;
  const query = await searchParams;
  const hasFilters = Boolean(query.q?.trim() || query.categoria?.trim());
  const t = await getTranslations({ locale, namespace: "feed" });
  const canonical = feedPath(resolvedLocale);
  const baseMetadata = buildFeedPageMetadata({
    locale: resolvedLocale,
    title: t("title"),
    description: t("defaultDescription"),
    canonicalPath: canonical,
    indexable: !hasFilters,
  });

  return {
    ...baseMetadata,
    alternates: {
      ...baseMetadata.alternates,
      types: {
        "application/rss+xml": `${canonical}/feed.xml`,
      },
    },
  };
}

export default async function NoticiasPage({ params, searchParams }: NoticiasPageProps) {
  const { locale } = await params;
  const resolvedLocale = locale as Locale;
  const query = await searchParams;
  const category = query.categoria?.trim();

  if (category && isCategoryLandingSlug(category)) {
    permanentRedirect(feedCategoryPath(resolvedLocale, category));
  }

  return <NewsFeedPage search={query.q} categorySlug={query.categoria} />;
}

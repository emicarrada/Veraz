import { Suspense } from "react";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";

import { Alert } from "@/components/ui/alert";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/text";
import { FeedEmptyState } from "@/features/news/components/feed-empty-state";
import { FeedFilters } from "@/features/news/components/feed-filters";
import { FeedHeader } from "@/features/news/components/feed-header";
import { FeedPagination } from "@/features/news/components/feed-pagination";
import { FeedSkeleton } from "@/features/news/components/feed-skeleton";
import { NewsAppShell } from "@/features/news/components/news-app-shell";
import { parseCategorySlug } from "@/features/news/classification/categories";
import { getFeedPage } from "@/features/news/services/get-feed-page";
import { countryLabel } from "@/features/news/utils/country-label";
import { homeFeedSlugs } from "@/features/news/utils/home-feed";
import { resolveVisitorCountry } from "@/features/news/utils/visitor-country";
import { getActiveReaderPreferences } from "@/features/auth";
import { resolveFeedSourceSlugs } from "@/features/news/config/prestigious-sources";
import type { Locale } from "@/i18n/routing";

export type NewsFeedPageProps = {
  search?: string;
  categorySlug?: string;
};

async function FeedContent({
  search,
  categorySlug,
  locale,
  visitorCountry,
  readerPreferences,
}: NewsFeedPageProps & {
  locale: Locale;
  visitorCountry: string;
  readerPreferences: { countryCodes: readonly string[]; topicSlugs: readonly string[] } | null;
}) {
  const tErrors = await getTranslations("errors");
  const result = await getFeedPage({
    locale,
    visitorCountry,
    ...(search?.trim() ? { search: search.trim() } : {}),
    ...(parseCategorySlug(categorySlug) ? { categorySlug: parseCategorySlug(categorySlug) } : {}),
    ...(readerPreferences
      ? {
          readerPreferences: {
            countryCodes: readerPreferences.countryCodes,
            topicSlugs: readerPreferences.topicSlugs,
          },
        }
      : {}),
  });

  if (!result.ok) {
    return (
      <Alert
        variant={result.error === "not_configured" ? "warning" : "danger"}
        title={tErrors("loadFailed")}
      >
        {result.message}
      </Alert>
    );
  }

  if (result.data.items.length === 0) {
    return <FeedEmptyState />;
  }

  return (
    <FeedPagination
      key={`${visitorCountry}|${categorySlug ?? ""}|${search ?? ""}|${readerPreferences?.countryCodes.join(",") ?? ""}|${readerPreferences?.topicSlugs.join(",") ?? ""}|${result.data.items[0]?.id ?? "empty"}`}
      initialPage={result.data}
      search={search?.trim()}
      categorySlug={parseCategorySlug(categorySlug)}
    />
  );
}

export async function NewsFeedPage({ search, categorySlug }: NewsFeedPageProps) {
  const locale = (await getLocale()) as Locale;
  const tFeed = await getTranslations("feed");
  const parsedCategory = parseCategorySlug(categorySlug);
  const readerPreferences = parsedCategory ? null : await getActiveReaderPreferences();
  const visitorCountry = resolveVisitorCountry(await headers());
  const homeCountryName = parsedCategory || readerPreferences
    ? null
    : countryLabel(
        visitorCountry,
        locale,
      );
  const hasHomeSources =
    !parsedCategory &&
    homeFeedSlugs(visitorCountry, resolveFeedSourceSlugs(locale)).home.length > 0;
  const suspenseKey = `${locale}|${visitorCountry}|${search ?? ""}|${categorySlug ?? ""}|${readerPreferences?.topicSlugs.join(",") ?? ""}|${readerPreferences?.countryCodes.join(",") ?? ""}`;

  return (
    <NewsAppShell>
      <Section padding="md" containerSize="md">
        <FeedHeader categorySlug={parsedCategory} />
        <Suspense fallback={null}>
          <FeedFilters />
        </Suspense>
        {parsedCategory || !hasHomeSources || !homeCountryName ? null : (
          <Text variant="caption" className="-mt-2 mb-4 text-ink-muted">
            {tFeed("homeCountryFirst", { country: homeCountryName })}
          </Text>
        )}
        <Suspense key={suspenseKey} fallback={<FeedSkeleton count={6} />}>
          <FeedContent
            search={search}
            categorySlug={categorySlug}
            locale={locale}
            visitorCountry={visitorCountry}
            readerPreferences={readerPreferences}
          />
        </Suspense>
      </Section>
    </NewsAppShell>
  );
}

import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { Alert } from "@/components/ui/alert";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/text";
import {
  getTopic,
  type NewsTopicGroup,
} from "@/features/news/classification/categories";
import { FeedEmptyState } from "@/features/news/components/feed-empty-state";
import { FeedFilters } from "@/features/news/components/feed-filters";
import { FeedHeader } from "@/features/news/components/feed-header";
import { FeedPagination } from "@/features/news/components/feed-pagination";
import { FeedSkeleton } from "@/features/news/components/feed-skeleton";
import { NewsAppShell } from "@/features/news/components/news-app-shell";
import { getFeedPage } from "@/features/news/services/get-feed-page";
import {
  buildCollectionPageJsonLd,
  buildBreadcrumbJsonLd,
  JsonLdScript,
} from "@/features/seo/build-json-ld";
import { getAppConfig } from "@/config";
import { feedCategoryPath, feedPath, homePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

export type CategoryFeedPageProps = {
  locale: Locale;
  categorySlug: NewsTopicGroup;
};

async function CategoryFeedContent({ locale, categorySlug }: CategoryFeedPageProps) {
  const tErrors = await getTranslations("errors");
  const result = await getFeedPage({ locale, categorySlug });

  if (!result.ok) {
    return (
      <Alert variant="danger" title={tErrors("loadFailed")}>
        {result.message}
      </Alert>
    );
  }

  if (result.data.items.length === 0) {
    return <FeedEmptyState />;
  }

  return <FeedPagination initialPage={result.data} categorySlug={categorySlug} />;
}

export async function CategoryFeedPage({ locale, categorySlug }: CategoryFeedPageProps) {
  const t = await getTranslations({ locale, namespace: "seo.category" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tFeed = await getTranslations({ locale, namespace: "feed.categories" });
  const { siteUrl } = getAppConfig();
  const topic = getTopic(categorySlug);
  const path = feedCategoryPath(locale, categorySlug);
  const categoryLabel = tFeed(categorySlug);
  const intro = t(`intro.${categorySlug}` as "intro.economia");

  const breadcrumb = buildBreadcrumbJsonLd(siteUrl, [
    { name: tNav("home"), path: homePath(locale) },
    { name: tNav("news"), path: feedPath(locale) },
    { name: topic?.label ?? categoryLabel, path },
  ]);

  const collection = buildCollectionPageJsonLd({
    siteUrl,
    path,
    name: t("pageTitle", { category: categoryLabel }),
    description: t("metaDescription", { category: categoryLabel }),
  });

  return (
    <NewsAppShell>
      <JsonLdScript schema={breadcrumb} />
      <JsonLdScript schema={collection} />
      <Section padding="md" containerSize="md">
        <FeedHeader categorySlug={categorySlug} />
        <Text as="p" variant="body" className="mb-6 max-w-3xl text-ink-secondary">
          {intro}
        </Text>
        <Suspense fallback={null}>
          <FeedFilters />
        </Suspense>
        <Suspense fallback={<FeedSkeleton count={6} />}>
          <CategoryFeedContent locale={locale} categorySlug={categorySlug} />
        </Suspense>
      </Section>
    </NewsAppShell>
  );
}

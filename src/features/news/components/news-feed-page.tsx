import { Alert } from "@/components/ui/alert";
import { Section } from "@/components/ui/section";
import { FeedEmptyState } from "@/features/news/components/feed-empty-state";
import { FeedFilters } from "@/features/news/components/feed-filters";
import { FeedHeader } from "@/features/news/components/feed-header";
import { FeedPagination } from "@/features/news/components/feed-pagination";
import { FeedSkeleton } from "@/features/news/components/feed-skeleton";
import { NewsAppShell } from "@/features/news/components/news-app-shell";
import { parseCategorySlug } from "@/features/news/classification/categories";
import { getFeedPage } from "@/features/news/services/get-feed-page";
import { Suspense } from "react";

export type NewsFeedPageProps = {
  search?: string;
  categorySlug?: string;
};

async function FeedContent({ search, categorySlug }: NewsFeedPageProps) {
  const result = await getFeedPage({
    ...(search?.trim() ? { search: search.trim() } : {}),
    ...(parseCategorySlug(categorySlug) ? { categorySlug: parseCategorySlug(categorySlug) } : {}),
  });

  if (!result.ok) {
    return (
      <Alert
        variant={result.error === "not_configured" ? "warning" : "danger"}
        title="No se pudo cargar el feed"
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
      initialPage={result.data}
      search={search?.trim()}
      categorySlug={parseCategorySlug(categorySlug)}
    />
  );
}

export function NewsFeedPage({ search, categorySlug }: NewsFeedPageProps) {
  const parsedCategory = parseCategorySlug(categorySlug);
  const suspenseKey = `${search ?? ""}|${categorySlug ?? ""}`;

  return (
    <NewsAppShell>
      <Section padding="md" containerSize="md">
        <FeedHeader categorySlug={parsedCategory} />
        <Suspense fallback={null}>
          <FeedFilters />
        </Suspense>
        <Suspense key={suspenseKey} fallback={<FeedSkeleton count={6} />}>
          <FeedContent search={search} categorySlug={categorySlug} />
        </Suspense>
      </Section>
    </NewsAppShell>
  );
}

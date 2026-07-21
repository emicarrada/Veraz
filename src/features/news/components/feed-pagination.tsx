"use client";

import { useCallback, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { loadMoreFeedArticles } from "@/features/news/actions/load-more-feed";
import type { NewsCategorySlug } from "@/features/news/classification/categories";
import { FeedList } from "@/features/news/components/feed-list";
import type { ArticleFeedItem, FeedPage } from "@/features/news/types/feed";
import { sortFeedItemsByPublishedAt } from "@/features/news/utils/sort-feed-items";

export type FeedPaginationProps = {
  initialPage: FeedPage;
  search?: string;
  categorySlug?: NewsCategorySlug;
};

export function FeedPagination({ initialPage, search, categorySlug }: FeedPaginationProps) {
  const t = useTranslations("feed");
  const [items, setItems] = useState<ReadonlyArray<ArticleFeedItem>>(initialPage.items);
  const [nextCursor, setNextCursor] = useState<string | undefined>(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadMore = useCallback(() => {
    if (!nextCursor || isPending) return;

    setErrorMessage(null);
    startTransition(async () => {
      const result = await loadMoreFeedArticles({
        cursor: nextCursor,
        ...(search ? { search } : {}),
        ...(categorySlug ? { categorySlug } : {}),
      });

      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }

      setItems((current) =>
        sortFeedItemsByPublishedAt([...current, ...result.data.items]),
      );
      setNextCursor(result.data.nextCursor);
      setHasMore(result.data.hasMore);
    });
  }, [categorySlug, isPending, nextCursor, search]);

  return (
    <div className="flex flex-col gap-6">
      <FeedList items={items} />

      {errorMessage ? (
        <Alert variant="danger" title="Error al cargar más noticias">
          {errorMessage}
        </Alert>
      ) : null}

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            loading={isPending}
            onClick={loadMore}
            disabled={!nextCursor || isPending}
          >
            {t("loadMore")}
          </Button>
        </div>
      ) : items.length > 0 ? (
        <p className="text-center text-small text-ink-muted">{t("endOfFeed")}</p>
      ) : null}
    </div>
  );
}

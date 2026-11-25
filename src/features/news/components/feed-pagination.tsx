"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { loadMoreFeedArticles } from "@/features/news/actions/load-more-feed";
import type { NewsCategorySlug } from "@/features/news/classification/categories";
import { FeedList } from "@/features/news/components/feed-list";
import type { ArticleFeedItem, FeedPage } from "@/features/news/types/feed";
import { beginFeedVisit, readStoredSlugs } from "@/features/news/utils/feed-memory";
import type { FeedCheckpoint } from "@/features/news/utils/present-feed";
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
  const [checkpoints, setCheckpoints] = useState<ReadonlyArray<FeedCheckpoint>>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [readSlugs, setReadSlugs] = useState<ReadonlySet<string>>(new Set());
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [memoryReady, setMemoryReady] = useState(false);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const blockedRef = useRef(false);

  useEffect(() => {
    setReadSlugs(new Set(readStoredSlugs()));
    setLastSeenAt(beginFeedVisit());
    setMemoryReady(true);

    const syncRead = () => {
      setReadSlugs(new Set(readStoredSlugs()));
    };
    window.addEventListener("veraz-feed-read", syncRead);
    window.addEventListener("focus", syncRead);
    return () => {
      window.removeEventListener("veraz-feed-read", syncRead);
      window.removeEventListener("focus", syncRead);
    };
  }, []);

  const loadMore = useCallback(
    (manual = false) => {
      if (!nextCursor || loadingRef.current) return;
      if (!manual && blockedRef.current) return;

      blockedRef.current = false;
      loadingRef.current = true;
      setErrorMessage(null);
      const cursor = nextCursor;

      startTransition(async () => {
        try {
          const result = await loadMoreFeedArticles({
            cursor,
            ...(search ? { search } : {}),
            ...(categorySlug ? { categorySlug } : {}),
          });

          if (!result.ok) {
            blockedRef.current = true;
            setErrorMessage(result.message);
            return;
          }

          const firstNew = result.data.items[0];
          if (firstNew) {
            setCheckpoints((current) =>
              current.some((checkpoint) => checkpoint.itemId === firstNew.id)
                ? current
                : [
                    ...current,
                    { itemId: firstNew.id, publishedAt: firstNew.publishedAt },
                  ],
            );
          }

          setItems((current) => {
            const seen = new Set(current.map((item) => item.id));
            return [...current, ...result.data.items.filter((item) => !seen.has(item.id))];
          });
          setNextCursor(result.data.nextCursor);
          setHasMore(result.data.hasMore);
        } finally {
          loadingRef.current = false;
        }
      });
    },
    [categorySlug, nextCursor, search],
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore(false);
        }
      },
      { rootMargin: "320px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, items.length, loadMore]);

  const sectionLabel = categorySlug ? t(`categories.${categorySlug}`) : t("title");

  const sinceLabel = useMemo(() => {
    if (!memoryReady || !lastSeenAt) return undefined;
    const freshCount = items.filter((item) => item.publishedAt > lastSeenAt).length;
    if (freshCount === 0) return undefined;
    const oldest = items[items.length - 1];
    const moreBelow = Boolean(hasMore && oldest && oldest.publishedAt > lastSeenAt);
    return moreBelow
      ? t("sinceLastVisitMore", { count: freshCount })
      : t("sinceLastVisit", { count: freshCount });
  }, [hasMore, items, lastSeenAt, memoryReady, t]);

  return (
    <div className="flex flex-col gap-6">
      <p className="sr-only" aria-live="polite">
        {isPending ? t("loading") : ""}
      </p>
      <FeedList
        items={items}
        checkpoints={checkpoints}
        sectionLabel={sectionLabel}
        readSlugs={readSlugs}
        showUnread={memoryReady}
        sinceLabel={sinceLabel}
      />

      {errorMessage ? (
        <Alert variant="danger" title={t("loadMoreFailed")}>
          {errorMessage}
        </Alert>
      ) : null}

      {hasMore ? (
        <div ref={sentinelRef} className="flex justify-center pt-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            loading={isPending}
            onClick={() => loadMore(true)}
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

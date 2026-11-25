"use client";

import { useTranslations } from "next-intl";

import { ArticleCard } from "@/features/news/components/article-card";
import { FeedPublishedTime } from "@/features/news/components/feed-published-time";
import { StoryClusterCard } from "@/features/news/components/story-cluster-card";
import type { ArticleFeedItem } from "@/features/news/types/feed";
import { buildFeedRows, type FeedCheckpoint } from "@/features/news/utils/present-feed";

export type FeedListProps = {
  items: ReadonlyArray<ArticleFeedItem>;
  checkpoints?: ReadonlyArray<FeedCheckpoint>;
  sectionLabel: string;
  readSlugs: ReadonlySet<string>;
  showUnread: boolean;
  sinceLabel?: string;
};

export function FeedList({
  items,
  checkpoints = [],
  sectionLabel,
  readSlugs,
  showUnread,
  sinceLabel,
}: FeedListProps) {
  const t = useTranslations("feed");
  const rows = buildFeedRows(items, checkpoints, { keepOrder: true });

  return (
    <div className="flex flex-col gap-4">
      {sinceLabel ? (
        <p className="border-l-2 border-accent pl-3 text-small text-ink">{sinceLabel}</p>
      ) : null}
      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {rows.map((row) => {
          if (row.kind === "marker") {
            return (
              <li key={`marker-${row.itemId}`} className="py-1 text-center text-small text-ink-muted">
                {t("continueMarker", { section: sectionLabel })}
                {" · "}
                <FeedPublishedTime iso={row.publishedAt} />
              </li>
            );
          }

          if (row.kind === "cluster") {
            return (
              <li key={`cluster-${row.items[0]?.id ?? row.variant}`}>
                <StoryClusterCard
                  items={row.items}
                  variant={row.variant}
                  readSlugs={readSlugs}
                  showUnread={showUnread}
                />
              </li>
            );
          }

          return (
            <li key={row.item.id}>
              <ArticleCard
                item={row.item}
                variant={row.variant}
                unread={showUnread && !readSlugs.has(row.item.slug)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

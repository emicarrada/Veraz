"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";
import { FeedPublishedTime } from "@/features/news/components/feed-published-time";
import { SafeArticleImage } from "@/features/news/components/safe-article-image";
import type { ArticleFeedItem } from "@/features/news/types/feed";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";

export type StoryClusterCardProps = {
  items: readonly ArticleFeedItem[];
  variant: "lead" | "media";
  readSlugs: ReadonlySet<string>;
  showUnread: boolean;
};

function sourceLine(items: readonly ArticleFeedItem[]): string {
  const names = items.map((item) => item.sourceAttributionName);
  if (names.length <= 4) return names.join(" · ");
  return `${names.slice(0, 3).join(" · ")} +${names.length - 3}`;
}

export function StoryClusterCard({
  items,
  variant,
  readSlugs,
  showUnread,
}: StoryClusterCardProps) {
  const t = useTranslations("feed");
  const [open, setOpen] = useState(false);
  const lead = items[0];
  if (!lead) return null;

  const unread = showUnread && items.some((item) => !readSlugs.has(item.slug));

  return (
    <article>
      <Card
        padding="none"
        className={cn("overflow-hidden", variant === "lead" && "border-accent/40")}
      >
        <div className={cn("flex flex-col gap-4 p-4 sm:p-5", variant === "media" && "sm:flex-row")}>
          <SafeArticleImage
            src={lead.heroImageUrl}
            fallbackSrc={lead.categoryFallbackImageUrl}
            alt=""
            loading={variant === "lead" ? "eager" : "lazy"}
            className={cn(
              "relative w-full shrink-0 rounded-lg",
              variant === "lead" ? "aspect-[16/9]" : "aspect-[16/10] sm:aspect-[4/3] sm:w-44",
            )}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {unread ? (
                <span className="inline-flex items-center gap-1.5 text-caption font-medium text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                  {t("unreadLabel")}
                </span>
              ) : null}
              <Tag variant="accent">{t("similarHeadlines", { count: items.length })}</Tag>
              <Tag variant="neutral">{lead.categoryLabel}</Tag>
              <Text variant="caption" className="text-ink-muted">
                <FeedPublishedTime iso={lead.publishedAt} />
              </Text>
            </div>
            {variant === "lead" ? (
              <h2 className="text-h2 text-balance leading-snug">
                <Link
                  href={`/noticias/${lead.slug}`}
                  className="veraz-focus-ring rounded-sm text-ink underline-offset-4 hover:text-accent hover:underline"
                >
                  {lead.title}
                </Link>
              </h2>
            ) : (
              <h3 className="text-h4 text-balance leading-snug">
                <Link
                  href={`/noticias/${lead.slug}`}
                  className="veraz-focus-ring rounded-sm text-ink underline-offset-4 hover:text-accent hover:underline"
                >
                  {lead.title}
                </Link>
              </h3>
            )}
            <p className="text-small text-ink-secondary">{sourceLine(items)}</p>
          </div>
        </div>

        <div className="px-4 pb-4 sm:px-5">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className="veraz-focus-ring rounded-sm text-small font-medium text-accent hover:text-accent-hover"
          >
            {open ? t("hideVersions") : t("showVersions")}
          </button>
          {open ? (
            <ul className="mt-3 flex list-none flex-col gap-1 border-t border-border p-0 pt-3">
              {items.map((item) => {
                const itemUnread = showUnread && !readSlugs.has(item.slug);
                return (
                  <li key={item.id}>
                    <Link
                      href={`/noticias/${item.slug}`}
                      className="veraz-focus-ring block rounded-md px-2 py-2 hover:bg-surface-muted"
                    >
                      <span className="flex flex-wrap items-center gap-2 text-caption text-ink-muted">
                        {itemUnread ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                        ) : null}
                        {item.sourceAttributionName}
                        <FeedPublishedTime iso={item.publishedAt} />
                      </span>
                      <span className="mt-0.5 block text-small text-ink">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </Card>
    </article>
  );
}

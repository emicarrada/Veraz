"use client";

import { useTranslations } from "next-intl";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";
import { FeedPublishedTime } from "@/features/news/components/feed-published-time";
import { SafeArticleImage } from "@/features/news/components/safe-article-image";
import type { ArticleFeedItem } from "@/features/news/types/feed";
import type { ArticleCardVariant } from "@/features/news/utils/present-feed";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";

export type ArticleCardProps = {
  item: ArticleFeedItem;
  variant?: ArticleCardVariant;
  unread?: boolean;
  className?: string;
};

function ArticleMetaRow({ item, unread }: { item: ArticleFeedItem; unread?: boolean }) {
  const t = useTranslations("feed");
  const tArticle = useTranslations("article");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {unread ? (
        <span className="inline-flex items-center gap-1.5 text-caption font-medium text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          {t("unreadLabel")}
        </span>
      ) : null}
      <Tag variant="accent">{item.categoryLabel}</Tag>
      <Tag variant="neutral">{item.sourceAttributionName}</Tag>
      {item.isTranslated ? <Tag variant="neutral">{tArticle("translatedBadge")}</Tag> : null}
      <Text variant="caption" className="text-ink-muted">
        <FeedPublishedTime iso={item.publishedAt} />
      </Text>
    </div>
  );
}

export function ArticleCard({
  item,
  variant = "media",
  unread = false,
  className,
}: ArticleCardProps) {
  const t = useTranslations("feed");

  return (
    <article className={cn("group", className)}>
      <Card
        interactive
        padding="none"
        className={cn("overflow-hidden", variant === "lead" && "border-accent/40")}
      >
        <Link
          href={`/noticias/${item.slug}`}
          aria-label={unread ? `${t("unreadLabel")}. ${item.title}` : item.title}
          className="veraz-focus-ring block rounded-xl text-ink"
        >
          {variant === "lead" ? (
            <div className="flex flex-col gap-4 p-4 sm:p-5">
              <SafeArticleImage
                src={item.heroImageUrl}
                fallbackSrc={item.categoryFallbackImageUrl}
                alt=""
                loading="eager"
                className="relative aspect-[16/9] w-full rounded-lg"
              />
              <div className="flex flex-col gap-3">
                <ArticleMetaRow item={item} unread={unread} />
                <h2 className="text-h2 text-balance leading-snug">{item.title}</h2>
                <p className="line-clamp-3 border-l-2 border-accent/40 pl-3 text-small leading-relaxed text-ink-secondary">
                  {item.summary}
                </p>
                {item.byline ? (
                  <Text variant="caption" className="text-ink-muted">
                    {item.byline}
                  </Text>
                ) : null}
              </div>
            </div>
          ) : null}

          {variant === "media" ? (
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:p-5">
              <SafeArticleImage
                src={item.heroImageUrl}
                fallbackSrc={item.categoryFallbackImageUrl}
                alt=""
                loading="lazy"
                className="relative aspect-[16/10] w-full shrink-0 rounded-lg sm:aspect-[4/3] sm:w-44"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <CardHeader className="mb-0 space-y-2">
                  <ArticleMetaRow item={item} unread={unread} />
                  <CardTitle className="text-balance leading-snug">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="mt-auto border-l-2 border-accent/40 pl-3">
                  <p className="line-clamp-3 text-small leading-relaxed text-ink-secondary">
                    {item.summary}
                  </p>
                </CardContent>
                {item.byline ? (
                  <CardFooter className="border-t-0 pt-0">
                    <Text variant="caption" className="text-ink-muted">
                      {item.byline}
                    </Text>
                  </CardFooter>
                ) : null}
              </div>
            </div>
          ) : null}

          {variant === "compact" ? (
            <div className="flex flex-col gap-1.5 px-4 py-3">
              <ArticleMetaRow item={item} unread={unread} />
              <h3 className="text-balance font-display text-base font-semibold leading-snug">
                {item.title}
              </h3>
              <p className="line-clamp-1 text-small text-ink-secondary">{item.summary}</p>
            </div>
          ) : null}
        </Link>
      </Card>
    </article>
  );
}

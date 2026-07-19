import Link from "next/link";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";
import { SafeArticleImage } from "@/features/news/components/safe-article-image";
import { articleDetailPath } from "@/features/news/constants";
import type { ArticleFeedItem } from "@/features/news/types/feed";
import { formatFeedDate } from "@/features/news/utils/format-feed-date";
import { cn } from "@/utils/cn";

export type ArticleCardProps = {
  item: ArticleFeedItem;
  className?: string;
};

export function ArticleCard({ item, className }: ArticleCardProps) {
  return (
    <article className={cn("group", className)}>
      <Card interactive padding="md" className="overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <SafeArticleImage
            src={item.heroImageUrl}
            fallbackSrc={item.categoryFallbackImageUrl}
            alt={item.title}
            loading="lazy"
            className="relative aspect-[16/10] w-full shrink-0 rounded-lg sm:aspect-[4/3] sm:w-44"
          />

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <CardHeader className="mb-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Tag variant="accent">{item.categoryLabel}</Tag>
                <Tag variant="neutral">{item.sourceAttributionName}</Tag>
                <Text variant="caption" className="text-ink-muted">
                  <time dateTime={item.publishedAt}>{formatFeedDate(item.publishedAt)}</time>
                </Text>
              </div>
              <CardTitle className="text-balance leading-snug">
                <Link
                  href={articleDetailPath(item.slug)}
                  className="veraz-focus-ring rounded-sm text-ink underline-offset-4 transition-colors hover:text-accent hover:underline"
                >
                  {item.title}
                </Link>
              </CardTitle>
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
      </Card>
    </article>
  );
}

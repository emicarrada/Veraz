import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";
import type { ArticleDetailItem } from "@/features/news/types/article-detail";
import { formatFeedDate } from "@/features/news/utils/format-feed-date";

export type ArticleMetaProps = {
  article: ArticleDetailItem;
};

export function ArticleMeta({ article }: ArticleMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <Tag variant="accent">{article.categoryLabel}</Tag>
      <Tag variant="neutral">{article.source.attributionName}</Tag>
      <Text variant="caption" className="text-ink-muted">
        <time dateTime={article.publishedAt}>{formatFeedDate(article.publishedAt)}</time>
      </Text>
      {article.byline ? (
        <Text variant="caption" className="text-ink-muted">
          {article.byline}
        </Text>
      ) : null}
    </div>
  );
}

import { ArticleCard } from "@/features/news/components/article-card";
import type { ArticleFeedItem } from "@/features/news/types/feed";

export type FeedListProps = {
  items: ReadonlyArray<ArticleFeedItem>;
};

export function FeedList({ items }: FeedListProps) {
  return (
    <ul className="flex list-none flex-col gap-4 p-0 m-0">
      {items.map((item) => (
        <li key={item.id}>
          <ArticleCard item={item} />
        </li>
      ))}
    </ul>
  );
}

import { Text } from "@/components/ui/text";
import type { ArticleDetailItem } from "@/features/news/types/article-detail";

export type ArticleHeaderProps = {
  article: ArticleDetailItem;
};

export function ArticleHeader({ article }: ArticleHeaderProps) {
  return (
    <header className="space-y-4 border-b border-border pb-6">
      <Text variant="h1" as="h1" className="text-balance">
        {article.title}
      </Text>
    </header>
  );
}

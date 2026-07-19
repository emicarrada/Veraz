import { Text } from "@/components/ui/text";
import type { ArticleDetailItem } from "@/features/news/types/article-detail";
import { splitIntoReadableParagraphs } from "@/features/news/utils/split-readable-paragraphs";

export type ArticleContentProps = {
  article: ArticleDetailItem;
};

export function ArticleContent({ article }: ArticleContentProps) {
  const source = article.bodyExcerpt?.trim() || article.excerpt.trim();
  const paragraphs = splitIntoReadableParagraphs(source);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <section aria-label="Contenido del artículo" className="space-y-4">
      {paragraphs.map((paragraph, index) => (
        <Text
          key={index}
          variant="body"
          className="max-w-3xl border-l-2 border-border pl-4 leading-relaxed text-ink-secondary"
        >
          {paragraph}
        </Text>
      ))}
    </section>
  );
}

import type { ArticleDetailItem } from "@/features/news/types/article-detail";
import { buildArticleNewsArticleJsonLd } from "@/features/news/services/get-article-by-slug";

export type ArticleJsonLdProps = {
  article: ArticleDetailItem;
  siteUrl: string;
};

export function ArticleJsonLd({ article, siteUrl }: ArticleJsonLdProps) {
  const schema = buildArticleNewsArticleJsonLd(article, siteUrl);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

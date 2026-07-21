import type { ArticleDetailItem } from "@/features/news/types/article-detail";
import { buildArticleNewsArticleJsonLd } from "@/features/news/services/get-article-by-slug";
import type { Locale } from "@/i18n/routing";

export type ArticleJsonLdProps = {
  article: ArticleDetailItem;
  siteUrl: string;
  locale: Locale;
};

export function ArticleJsonLd({ article, siteUrl, locale }: ArticleJsonLdProps) {
  const schema = buildArticleNewsArticleJsonLd(article, siteUrl, locale);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

import type { ArticleId } from "@/domain/shared/ids";
import type { Locale } from "@/i18n/routing";

export type ArticleTranslation = {
  articleId: ArticleId;
  locale: Locale;
  title: string;
  excerpt: string;
  bodyExcerpt?: string;
  sourceLocale: string;
  provider: "ai" | "manual";
  createdAt: string;
};

export type ArticleTranslationInput = Omit<ArticleTranslation, "createdAt">;

export type ArticleTranslationRepository = {
  findByArticleIds(
    articleIds: ReadonlyArray<ArticleId>,
    locale: Locale,
  ): Promise<Map<ArticleId, ArticleTranslation>>;
  save(input: ArticleTranslationInput): Promise<ArticleTranslation>;
};

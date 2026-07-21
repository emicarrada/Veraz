import type { ReferenceKind } from "@/domain/shared/enums";
import type { ArticleId } from "@/domain/shared/ids";
import type { Url } from "@/domain/shared/value-objects";
import type { NewsCategorySlug } from "@/features/news/classification/categories";

export type ArticleDetailReference = {
  url: Url;
  title?: string;
  publisherName?: string;
  kind: ReferenceKind;
};

export type ArticleDetailItem = {
  id: ArticleId;
  slug: string;
  title: string;
  excerpt: string;
  bodyExcerpt?: string;
  publishedAt: string;
  canonicalUrl: Url;
  byline?: string;
  categorySlug: NewsCategorySlug;
  categoryLabel: string;
  categoryFallbackImageUrl: Url;
  languageCode: string;
  isTranslated: boolean;
  showOriginalLanguageNote: boolean;
  source: {
    name: string;
    slug: string;
    attributionName: string;
    homepageUrl: Url;
  };
  heroImage?: {
    url: Url;
    altText?: string;
    credit?: string;
  };
  references: ReadonlyArray<ArticleDetailReference>;
};

export type ArticleDetailLoadErrorCode = "not_found" | "not_configured" | "load_failed";

export type ArticleDetailLoadResult =
  | { ok: true; data: ArticleDetailItem }
  | { ok: false; error: "not_found" }
  | { ok: false; error: "not_configured" | "load_failed"; message: string };

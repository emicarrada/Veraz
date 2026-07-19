import type {
  ArticleId,
  CountryId,
  LanguageId,
  MediaId,
  SourceId,
} from "@/domain/shared/ids";
import type { ArticleStatus, ContentFormat } from "@/domain/shared/enums";
import type { Instant, Slug, Url } from "@/domain/shared/value-objects";

export type Article = {
  id: ArticleId;
  sourceId: SourceId;
  slug: Slug;
  canonicalUrl: Url;
  urlFingerprint: string;
  title: string;
  excerpt: string;
  bodyExcerpt?: string;
  contentFormat: ContentFormat;
  languageId: LanguageId;
  primaryCountryId?: CountryId;
  publishedAt: Instant;
  ingestedAt: Instant;
  updatedAt: Instant;
  status: ArticleStatus;
  paywallOriginal: boolean;
  heroMediaId?: MediaId;
  byline?: string;
};

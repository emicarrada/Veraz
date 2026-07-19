import type { Source } from "@/domain/catalog/source";
import type { Article } from "@/domain/content/article";
import type { Media } from "@/domain/content/media";
import type { Reference } from "@/domain/content/reference";
import type {
  ArticleId,
  LanguageId,
  MediaId,
  ReferenceId,
  SourceId,
} from "@/domain/shared/ids";
import type {
  ArticleStatus,
  ContentFormat,
  MediaKind,
  ReferenceKind,
  SourceStatus,
  SourceTrustTier,
} from "@/domain/shared/enums";
import type { Database } from "@/lib/supabase/database.types";
import type { NewsCategorySlug } from "@/features/news/classification/categories";

type SourceRow = Database["public"]["Tables"]["sources"]["Row"];
type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
type MediaRow = Database["public"]["Tables"]["media"]["Row"];
type ReferenceRow = Database["public"]["Tables"]["article_references"]["Row"];

export function toSourceId(id: string): SourceId {
  return id as SourceId;
}

export function toArticleId(id: string): ArticleId {
  return id as ArticleId;
}

export function toMediaId(id: string): MediaId {
  return id as MediaId;
}

export function toReferenceId(id: string): ReferenceId {
  return id as ReferenceId;
}

export function toLanguageId(id: string): LanguageId {
  return id as LanguageId;
}

export function mapSourceRow(row: SourceRow): Source {
  return {
    id: toSourceId(row.id),
    slug: row.slug,
    name: row.name,
    homepageUrl: row.homepage_url,
    ...(row.feed_url ? { feedUrl: row.feed_url } : {}),
    ...(row.logo_media_id ? { logoMediaId: toMediaId(row.logo_media_id) } : {}),
    ...(row.default_language_id
      ? { defaultLanguageId: toLanguageId(row.default_language_id) }
      : {}),
    trustTier: row.trust_tier as SourceTrustTier,
    status: row.status as SourceStatus,
    attributionName: row.attribution_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapArticleRow(row: ArticleRow): Article {
  return {
    id: toArticleId(row.id),
    sourceId: toSourceId(row.source_id),
    slug: row.slug,
    canonicalUrl: row.canonical_url,
    urlFingerprint: row.url_fingerprint,
    title: row.title,
    excerpt: row.excerpt,
    ...(row.body_excerpt ? { bodyExcerpt: row.body_excerpt } : {}),
    contentFormat: row.content_format as ContentFormat,
    languageId: toLanguageId(row.language_id),
    publishedAt: row.published_at,
    ingestedAt: row.ingested_at,
    updatedAt: row.updated_at,
    status: row.status as ArticleStatus,
    paywallOriginal: row.paywall_original,
    ...(row.hero_media_id ? { heroMediaId: toMediaId(row.hero_media_id) } : {}),
    ...(row.byline ? { byline: row.byline } : {}),
  };
}

export function mapMediaRow(row: MediaRow): Media {
  return {
    id: toMediaId(row.id),
    kind: row.kind as MediaKind,
    url: row.url,
    ...(row.storage_key ? { storageKey: row.storage_key } : {}),
    ...(row.mime_type ? { mimeType: row.mime_type } : {}),
    ...(row.width != null ? { width: row.width } : {}),
    ...(row.height != null ? { height: row.height } : {}),
    ...(row.duration_ms != null ? { durationMs: row.duration_ms } : {}),
    ...(row.alt_text ? { altText: row.alt_text } : {}),
    ...(row.credit ? { credit: row.credit } : {}),
    ...(row.license ? { license: row.license } : {}),
    ...(row.article_id ? { articleId: toArticleId(row.article_id) } : {}),
  };
}

export function mapReferenceRow(row: ReferenceRow): Reference {
  return {
    id: toReferenceId(row.id),
    articleId: toArticleId(row.article_id),
    url: row.url,
    ...(row.title ? { title: row.title } : {}),
    ...(row.publisher_name ? { publisherName: row.publisher_name } : {}),
    kind: row.kind as ReferenceKind,
    ...(row.accessed_at ? { accessedAt: row.accessed_at } : {}),
  };
}

export function toArticleInsertRow(
  input: {
    id: ArticleId;
    sourceId: SourceId;
    languageId: LanguageId;
    article: Omit<
      Article,
      "id" | "sourceId" | "languageId" | "primaryCountryId" | "heroMediaId"
    >;
    heroMediaId?: MediaId;
    categorySlug: NewsCategorySlug;
  },
): Database["public"]["Tables"]["articles"]["Insert"] {
  return {
    id: input.id,
    source_id: input.sourceId,
    language_id: input.languageId,
    slug: input.article.slug,
    canonical_url: input.article.canonicalUrl,
    url_fingerprint: input.article.urlFingerprint,
    title: input.article.title,
    excerpt: input.article.excerpt,
    body_excerpt: input.article.bodyExcerpt ?? null,
    content_format: input.article.contentFormat,
    published_at: input.article.publishedAt,
    ingested_at: input.article.ingestedAt,
    updated_at: input.article.updatedAt,
    status: input.article.status,
    paywall_original: input.article.paywallOriginal,
    byline: input.article.byline ?? null,
    hero_media_id: input.heroMediaId ?? null,
    category_slug: input.categorySlug,
  };
}

export function toMediaInsertRow(
  media: Omit<Media, "id" | "articleId">,
  articleId: ArticleId,
  id: MediaId,
): Database["public"]["Tables"]["media"]["Insert"] {
  return {
    id,
    article_id: articleId,
    kind: media.kind,
    url: media.url,
    storage_key: media.storageKey ?? null,
    mime_type: media.mimeType ?? null,
    width: media.width ?? null,
    height: media.height ?? null,
    duration_ms: media.durationMs ?? null,
    alt_text: media.altText ?? null,
    credit: media.credit ?? null,
    license: media.license ?? null,
  };
}

export function toReferenceInsertRow(
  reference: Omit<Reference, "id" | "articleId">,
  articleId: ArticleId,
  id: ReferenceId,
): Database["public"]["Tables"]["article_references"]["Insert"] {
  return {
    id,
    article_id: articleId,
    url: reference.url,
    title: reference.title ?? null,
    publisher_name: reference.publisherName ?? null,
    kind: reference.kind,
    accessed_at: reference.accessedAt ?? null,
  };
}

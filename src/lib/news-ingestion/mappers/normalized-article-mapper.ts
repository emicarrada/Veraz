import type { Article } from "@/domain/content/article";
import type { Media } from "@/domain/content/media";
import type { Reference } from "@/domain/content/reference";
import type { Slug } from "@/domain/shared/value-objects";
import type { NormalizedArticle } from "@/lib/news-ingestion/types/article";

export type MappedArticleBundle = {
  sourceSlug: string;
  languageCode: string;
  article: Omit<
    Article,
    "id" | "sourceId" | "languageId" | "primaryCountryId" | "heroMediaId"
  >;
  heroMedia?: Omit<Media, "id" | "articleId">;
  references: ReadonlyArray<Omit<Reference, "id" | "articleId">>;
};

/**
 * Maps ingestion NormalizedArticle → domain-shaped persist bundle.
 * No I/O — persistence is handled separately by repositories.
 */
export class NormalizedArticleMapper {
  map(normalized: NormalizedArticle, now: string = new Date().toISOString()): MappedArticleBundle {
    const slug = buildArticleSlug(normalized.title, normalized.urlFingerprint);

    const article: MappedArticleBundle["article"] = {
      slug,
      canonicalUrl: normalized.canonicalUrl,
      urlFingerprint: normalized.urlFingerprint,
      title: normalized.title,
      excerpt: normalized.excerpt,
      contentFormat: normalized.contentFormat,
      publishedAt: normalized.publishedAt,
      ingestedAt: now,
      updatedAt: now,
      status: "ingested",
      paywallOriginal: normalized.paywallOriginal,
      ...(normalized.bodyExcerpt ? { bodyExcerpt: normalized.bodyExcerpt } : {}),
      ...(normalized.byline ? { byline: normalized.byline } : {}),
    };

    const heroMedia = normalized.heroImageUrl
      ? {
          kind: "image" as const,
          url: normalized.heroImageUrl,
          altText: normalized.title,
        }
      : undefined;

    const references = mapReferences(normalized);

    return {
      sourceSlug: normalized.sourceSlug,
      languageCode: normalized.languageCode,
      article,
      ...(heroMedia ? { heroMedia } : {}),
      references,
    };
  }
}

function mapReferences(
  normalized: NormalizedArticle,
): ReadonlyArray<Omit<Reference, "id" | "articleId">> {
  const drafts = normalized.references?.length
    ? normalized.references
    : [
        {
          url: normalized.canonicalUrl,
          title: normalized.title,
          kind: "original" as const,
        },
      ];

  return drafts.map((draft) => ({
    url: draft.url,
    kind: draft.kind,
    ...(draft.title ? { title: draft.title } : {}),
    ...(draft.publisherName ? { publisherName: draft.publisherName } : {}),
  }));
}

export function buildArticleSlug(title: string, urlFingerprint: string): Slug {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  const suffix = urlFingerprint.slice(0, 8);
  const slugBase = base.length > 0 ? base : "article";
  return `${slugBase}-${suffix}`;
}

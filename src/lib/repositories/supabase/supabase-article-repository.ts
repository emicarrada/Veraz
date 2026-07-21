import type { NewsTopicSlug } from "@/features/news/classification/categories";
import {
  getTopicSlugsForFilter,
  parseCategorySlug,
} from "@/features/news/classification/categories";
import { randomUUID } from "node:crypto";

import type { Article } from "@/domain/content/article";
import type { ArticleId, LanguageId, MediaId, ReferenceId } from "@/domain/shared/ids";
import type {
  ArticleFeedRecord,
  ArticleDetailRecord,
  ArticlePersistInput,
  ArticlePersistResult,
  ArticleRepository,
  ListFeedArticlesParams,
  ListFeedArticlesResult,
} from "@/lib/repositories/contracts/article-repository";
import {
  mapArticleRow,
  mapMediaRow,
  mapReferenceRow,
  mapSourceRow,
  toArticleInsertRow,
  toLanguageId,
  toMediaInsertRow,
  toReferenceInsertRow,
} from "@/lib/repositories/supabase/row-mappers";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Visible in feed until publish pipeline promotes items explicitly. */
const FEED_STATUSES = ["ingested", "published"] as const;

type ArticleWithSourceRow = Database["public"]["Tables"]["articles"]["Row"] & {
  sources: Pick<
    Database["public"]["Tables"]["sources"]["Row"],
    "name" | "slug" | "attribution_name"
  >;
  languages: Pick<Database["public"]["Tables"]["languages"]["Row"], "code"> | null;
};

type ArticleDetailRow = Database["public"]["Tables"]["articles"]["Row"] & {
  sources: Pick<
    Database["public"]["Tables"]["sources"]["Row"],
    "id" | "slug" | "name" | "attribution_name" | "homepage_url"
  >;
  languages: Pick<Database["public"]["Tables"]["languages"]["Row"], "code"> | null;
  article_references: Database["public"]["Tables"]["article_references"]["Row"][];
};

/** Fail-open when languages join is missing (orphan language_id). */
export function resolveLanguageCode(row: { languages?: { code: string } | null }): string {
  const code = row.languages?.code?.trim().toLowerCase().split("-")[0];
  return code && code.length > 0 ? code : "es";
}

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

export class SupabaseArticleRepository implements ArticleRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findByUrlFingerprint(urlFingerprint: string): Promise<Article | null> {
    const { data, error } = await this.client
      .from("articles")
      .select("*")
      .eq("url_fingerprint", urlFingerprint)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find article by fingerprint: ${error.message}`);
    }

    return data ? mapArticleRow(data) : null;
  }

  async findBySlug(slug: string): Promise<ArticleDetailRecord | null> {
    const { data, error } = await this.client
      .from("articles")
      .select(
        `
        *,
        sources!inner (
          id,
          slug,
          name,
          attribution_name,
          homepage_url
        ),
        languages (
          code
        ),
        article_references (
          id,
          article_id,
          url,
          title,
          publisher_name,
          kind,
          accessed_at
        )
      `,
      )
      .eq("slug", slug)
      .in("status", [...FEED_STATUSES])
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find article by slug: ${error.message}`);
    }

    if (!data) return null;

    const row = data as ArticleDetailRow;
    let heroMedia: ReturnType<typeof mapMediaRow> | undefined;

    if (row.hero_media_id) {
      const { data: mediaRow, error: mediaError } = await this.client
        .from("media")
        .select("*")
        .eq("id", row.hero_media_id)
        .maybeSingle();

      if (mediaError) {
        throw new Error(`Failed to load hero media: ${mediaError.message}`);
      }

      if (mediaRow) {
        heroMedia = mapMediaRow(mediaRow);
      }
    }

    const source = mapSourceRow({
      id: row.sources.id,
      slug: row.sources.slug,
      name: row.sources.name,
      homepage_url: row.sources.homepage_url,
      feed_url: null,
      logo_media_id: null,
      default_language_id: null,
      country_id: null,
      trust_tier: "unrated",
      status: "active",
      attribution_name: row.sources.attribution_name,
      created_at: row.published_at,
      updated_at: row.published_at,
    });

    return {
      article: mapArticleRow(row),
      categorySlug: parseCategorySlug(row.category_slug) ?? "general",
      languageCode: resolveLanguageCode(row),
      source: {
        id: source.id,
        slug: source.slug,
        name: source.name,
        attributionName: source.attributionName,
        homepageUrl: source.homepageUrl,
      },
      references: (row.article_references ?? []).map(mapReferenceRow),
      ...(heroMedia ? { heroMedia } : {}),
    };
  }

  async listForFeed(params: ListFeedArticlesParams): Promise<ListFeedArticlesResult> {
    const limit = Math.max(1, Math.min(params.limit, 50));

    let sourceIds: string[] | undefined;
    if (params.sourceSlugs && params.sourceSlugs.length > 0) {
      const { data: sourceRows, error: sourceError } = await this.client
        .from("sources")
        .select("id")
        .in("slug", [...params.sourceSlugs]);

      if (sourceError) {
        throw new Error(`Failed to resolve prestigious sources: ${sourceError.message}`);
      }

      sourceIds = (sourceRows ?? []).map((row) => row.id);
      if (sourceIds.length === 0) {
        return { items: [], hasMore: false };
      }
    }

    let excludeSourceIds: string[] | undefined;
    if (params.excludeSourceSlugs && params.excludeSourceSlugs.length > 0) {
      const { data: excludeRows, error: excludeError } = await this.client
        .from("sources")
        .select("id")
        .in("slug", [...params.excludeSourceSlugs]);

      if (excludeError) {
        throw new Error(`Failed to resolve excluded sources: ${excludeError.message}`);
      }

      excludeSourceIds = (excludeRows ?? []).map((row) => row.id);
    }

    let query = this.client
      .from("articles")
      .select(
        `
        *,
        sources!inner (
          name,
          slug,
          attribution_name
        ),
        languages (
          code
        )
      `,
      )
      .in("status", [...FEED_STATUSES]);

    if (sourceIds) {
      query = query.in("source_id", sourceIds);
    }

    if (excludeSourceIds && excludeSourceIds.length > 0) {
      query = query.not("source_id", "in", `(${excludeSourceIds.join(",")})`);
    }

    if (params.languageCodes && params.languageCodes.length > 0) {
      query = query.in("languages.code", [...params.languageCodes]);
    }

    if (params.categorySlug) {
      const slugs = getTopicSlugsForFilter(params.categorySlug);
      if (slugs.length === 1) {
        query = query.eq("category_slug", slugs[0]!);
      } else if (slugs.length > 1) {
        query = query.in("category_slug", slugs);
      }
    }

    const search = params.search?.trim();
    if (search) {
      const pattern = `%${escapeIlikePattern(search)}%`;
      query = query.or(`title.ilike.${pattern},excerpt.ilike.${pattern}`);
    }

    if (params.cursor) {
      const { publishedAt, ingestedAt, id } = params.cursor;
      query = query.or(
        `published_at.lt.${publishedAt},and(published_at.eq.${publishedAt},ingested_at.lt.${ingestedAt}),and(published_at.eq.${publishedAt},ingested_at.eq.${ingestedAt},id.lt.${id})`,
      );
    }

    query = query
      .order("published_at", { ascending: false })
      .order("ingested_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limit + 1);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list feed articles: ${error.message}`);
    }

    const rows = (data ?? []) as ArticleWithSourceRow[];
    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    const heroMediaIds = pageRows
      .map((row) => row.hero_media_id)
      .filter((id): id is string => Boolean(id));

    const heroUrlByMediaId = await this.loadHeroImageUrls(heroMediaIds);
    const items = pageRows.map((row) => this.toFeedRecord(row, heroUrlByMediaId));

    const last = pageRows.at(-1);
    const nextCursor =
      hasMore && last
        ? {
            publishedAt: last.published_at,
            ingestedAt: last.ingested_at,
            id: last.id as ArticleId,
          }
        : undefined;

    return {
      items,
      ...(nextCursor ? { nextCursor } : {}),
      hasMore,
    };
  }

  private async loadHeroImageUrls(mediaIds: string[]): Promise<Map<string, string>> {
    if (mediaIds.length === 0) return new Map();

    const { data, error } = await this.client
      .from("media")
      .select("id, url")
      .in("id", mediaIds);

    if (error) {
      throw new Error(`Failed to load hero media: ${error.message}`);
    }

    return new Map((data ?? []).map((row) => [row.id, row.url]));
  }

  private toFeedRecord(
    row: ArticleWithSourceRow,
    heroUrlByMediaId: Map<string, string>,
  ): ArticleFeedRecord {
    const article = mapArticleRow(row);
    const heroImageUrl = row.hero_media_id
      ? heroUrlByMediaId.get(row.hero_media_id)
      : undefined;

    return {
      article,
      categorySlug: parseCategorySlug(row.category_slug) ?? "general",
      languageCode: resolveLanguageCode(row),
      sourceName: row.sources.name,
      sourceSlug: row.sources.slug,
      sourceAttributionName: row.sources.attribution_name,
      ...(heroImageUrl ? { heroImageUrl } : {}),
    };
  }

  async save(input: ArticlePersistInput): Promise<ArticlePersistResult> {
    const existing = await this.findByUrlFingerprint(input.article.urlFingerprint);
    const created = !existing;
    const articleId = existing?.id ?? (randomUUID() as ArticleId);

    let heroMediaId: MediaId | undefined;
    if (input.heroMedia) {
      heroMediaId = randomUUID() as MediaId;
    }

    const articleRow = toArticleInsertRow({
      id: articleId,
      sourceId: input.sourceId,
      languageId: input.languageId,
      categorySlug: input.categorySlug,
      article: input.article,
    });

    const { error: articleError } = await this.client
      .from("articles")
      .upsert(articleRow, { onConflict: "url_fingerprint" })
      .select("*")
      .single();

    if (articleError) {
      throw new Error(`Failed to save article: ${articleError.message}`);
    }

    await this.replaceMedia(articleId, input.heroMedia, heroMediaId);
    await this.replaceReferences(articleId, input.references);

    const refreshed = await this.findByUrlFingerprint(input.article.urlFingerprint);
    if (!refreshed) {
      throw new Error("Article missing after save.");
    }

    return { article: refreshed, created };
  }

  private async replaceMedia(
    articleId: ArticleId,
    heroMedia: ArticlePersistInput["heroMedia"],
    heroMediaId?: MediaId,
  ): Promise<void> {
    const { error: deleteError } = await this.client
      .from("media")
      .delete()
      .eq("article_id", articleId);

    if (deleteError) {
      throw new Error(`Failed to clear media: ${deleteError.message}`);
    }

    if (!heroMedia || !heroMediaId) return;

    const mediaRow = toMediaInsertRow(heroMedia, articleId, heroMediaId);
    const { error: insertError } = await this.client.from("media").insert(mediaRow);

    if (insertError) {
      throw new Error(`Failed to insert hero media: ${insertError.message}`);
    }

    const { error: updateError } = await this.client
      .from("articles")
      .update({ hero_media_id: heroMediaId })
      .eq("id", articleId);

    if (updateError) {
      throw new Error(`Failed to link hero media: ${updateError.message}`);
    }
  }

  private async replaceReferences(
    articleId: ArticleId,
    references: ArticlePersistInput["references"],
  ): Promise<void> {
    const { error: deleteError } = await this.client
      .from("article_references")
      .delete()
      .eq("article_id", articleId);

    if (deleteError) {
      throw new Error(`Failed to clear references: ${deleteError.message}`);
    }

    if (references.length === 0) return;

    const rows = references.map((reference) =>
      toReferenceInsertRow(reference, articleId, randomUUID() as ReferenceId),
    );

    const { error: insertError } = await this.client
      .from("article_references")
      .insert(rows);

    if (insertError) {
      throw new Error(`Failed to insert references: ${insertError.message}`);
    }
  }

  /** Resolves a BCP-47 language code to a catalog LanguageId. */
  async resolveLanguageId(languageCode: string): Promise<LanguageId> {
    const normalized = languageCode.trim().toLowerCase().split("-")[0] ?? languageCode;

    const { data, error } = await this.client
      .from("languages")
      .select("id")
      .eq("code", normalized)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to resolve language "${normalized}": ${error.message}`);
    }

    if (!data) {
      throw new Error(`Language "${normalized}" is not in catalog.`);
    }

    return toLanguageId(data.id);
  }
}

import type { NewsTopicSlug } from "@/features/news/classification/categories";
import {
  getTopicSlugsForFilter,
  parseCategorySlug,
} from "@/features/news/classification/categories";
import { randomUUID } from "node:crypto";

import type { Article } from "@/domain/content/article";
import type { ArticleId, LanguageId, MediaId, ReferenceId } from "@/domain/shared/ids";
import { resolveFeedLane, type FeedLane } from "@/lib/repositories/contracts/feed-lane";
import type {
  ArticleFeedRecord,
  ArticleDetailRecord,
  ArticlePersistInput,
  ArticlePersistResult,
  ArticleRepository,
  ListFeedArticlesParams,
  ListFeedArticlesResult,
  ListPublishedForSitemapParams,
  ListPublishedForSitemapResult,
  SitemapArticleRecord,
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

function mergeFeedRows(rows: ArticleWithSourceRow[]): ArticleWithSourceRow[] {
  const byId = new Map<string, ArticleWithSourceRow>();
  for (const row of rows) byId.set(row.id, row);
  return [...byId.values()].sort((left, right) => {
    if (left.published_at !== right.published_at) {
      return left.published_at < right.published_at ? 1 : -1;
    }
    if (left.ingested_at !== right.ingested_at) {
      return left.ingested_at < right.ingested_at ? 1 : -1;
    }
    return left.id < right.id ? 1 : -1;
  });
}

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

  async listPublishedForSitemap(
    params: ListPublishedForSitemapParams,
  ): Promise<ListPublishedForSitemapResult> {
    const limit = Math.max(1, Math.min(params.limit, 500));

    let query = this.client
      .from("articles")
      .select(
        `
        id,
        slug,
        title,
        published_at,
        ingested_at,
        category_slug,
        sources!inner (
          slug
        ),
        languages (
          code
        )
      `,
      )
      .in("status", [...FEED_STATUSES]);

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
      throw new Error(`Failed to list sitemap articles: ${error.message}`);
    }

    type SitemapRow = {
      id: string;
      slug: string;
      title: string;
      published_at: string;
      ingested_at: string;
      category_slug: string;
      sources: { slug: string };
      languages: { code: string } | null;
    };

    const rows = (data ?? []) as SitemapRow[];
    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    const items: SitemapArticleRecord[] = pageRows.map((row) => ({
      slug: row.slug,
      title: row.title,
      publishedAt: row.published_at,
      sourceSlug: row.sources.slug,
      categorySlug: parseCategorySlug(row.category_slug) ?? "general",
      languageCode: resolveLanguageCode(row),
    }));

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

  async listForFeed(params: ListFeedArticlesParams): Promise<ListFeedArticlesResult> {
    const limit = Math.max(1, Math.min(params.limit, 50));
    if ((params.prioritizeSourceSlugs?.length ?? 0) > 0) {
      return this.listPrioritizedFeed(params, limit);
    }

    const sourceIds = await this.resolveSourceIds(params.sourceSlugs);
    if (params.sourceSlugs?.length && sourceIds.length === 0) {
      return { items: [], hasMore: false };
    }

    if (params.chronological) {
      const rows = await this.fetchFeedSlice(params, limit + 1, {
        ...(params.sourceSlugs?.length ? { sourceIds } : {}),
      });
      const hasMore = rows.length > limit;
      const pageRows = hasMore ? rows.slice(0, limit) : rows;
      const heroMediaIds = pageRows
        .map((row) => row.hero_media_id)
        .filter((id): id is string => Boolean(id));
      const heroUrlByMediaId = await this.loadHeroImageUrls(heroMediaIds);
      const items = pageRows.map((row) => this.toFeedRecord(row, heroUrlByMediaId));
      const last = pageRows.at(-1);
      return {
        items,
        ...(hasMore && last
          ? {
              nextCursor: {
                publishedAt: last.published_at,
                ingestedAt: last.ingested_at,
                id: last.id as ArticleId,
              },
            }
          : {}),
        hasMore,
      };
    }

    const startRank = params.cursor?.imageRank ?? 0;
    const rows: ArticleWithSourceRow[] = [];
    const sliceSources = params.sourceSlugs?.length ? sourceIds : undefined;
    if (startRank === 0) {
      rows.push(
        ...(await this.fetchFeedSlice(params, limit + 1, {
          ...(sliceSources ? { sourceIds: sliceSources } : {}),
          image: "own",
        })),
      );
    }
    if (rows.length <= limit) {
      rows.push(
        ...(await this.fetchFeedSlice(
          { ...params, cursor: startRank === 1 ? params.cursor : undefined },
          limit + 1 - rows.length,
          {
            ...(sliceSources ? { sourceIds: sliceSources } : {}),
            image: "none",
          },
        )),
      );
    }

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const heroMediaIds = pageRows
      .map((row) => row.hero_media_id)
      .filter((id): id is string => Boolean(id));
    const heroUrlByMediaId = await this.loadHeroImageUrls(heroMediaIds);
    const items = pageRows.map((row) => this.toFeedRecord(row, heroUrlByMediaId));
    const last = pageRows.at(-1);

    return {
      items,
      ...(hasMore && last
        ? {
            nextCursor: {
              publishedAt: last.published_at,
              ingestedAt: last.ingested_at,
              id: last.id as ArticleId,
              imageRank: last.hero_media_id ? 0 : 1,
            },
          }
        : {}),
      hasMore,
    };
  }

  private async resolveSourceIds(slugs: readonly string[] | undefined): Promise<string[]> {
    if (!slugs || slugs.length === 0) return [];
    const { data, error } = await this.client.from("sources").select("id").in("slug", [...slugs]);
    if (error) {
      throw new Error(`Failed to resolve feed sources: ${error.message}`);
    }
    return (data ?? []).map((row) => row.id);
  }


  private async listPrioritizedFeed(
    params: ListFeedArticlesParams,
    limit: number,
  ): Promise<ListFeedArticlesResult> {
    const homeSlugs = [...(params.prioritizeSourceSlugs ?? [])];
    const leadSlugs = [...(params.leadSourceSlugs ?? [])].filter((slug) => homeSlugs.includes(slug));
    const slugs = [...new Set([...(params.sourceSlugs ?? []), ...homeSlugs])];
    const { data: sourceRows, error: sourceError } = await this.client
      .from("sources")
      .select("id, slug")
      .in("slug", slugs);

    if (sourceError) {
      throw new Error(`Failed to resolve feed sources: ${sourceError.message}`);
    }

    const idBySlug = new Map((sourceRows ?? []).map((row) => [row.slug, row.id]));
    const homeIds = homeSlugs.flatMap((slug) => {
      const id = idBySlug.get(slug);
      return id ? [id] : [];
    });
    const leadIds = leadSlugs.flatMap((slug) => {
      const id = idBySlug.get(slug);
      return id ? [id] : [];
    });

    if (homeIds.length === 0) {
      return this.listForFeed({
        ...params,
        prioritizeSourceSlugs: undefined,
        leadSourceSlugs: undefined,
      });
    }

    const homeIdSet = new Set(homeIds);
    const leadIdSet = new Set(leadIds);
    const visibleIds = params.sourceSlugs?.length
      ? params.sourceSlugs.flatMap((slug) => {
          const id = idBySlug.get(slug);
          return id ? [id] : [];
        })
      : undefined;
    const worldIds = visibleIds?.filter((id) => !homeIdSet.has(id));
    const otherHomeIds = homeIds.filter((id) => !leadIdSet.has(id));
    const startLane: FeedLane = params.cursor?.lane ?? 0;
    const rows: ArticleWithSourceRow[] = [];

    const pull = async (
      lane: FeedLane,
      sourceIds: string[] | undefined,
      options: {
        category?: "cultura" | "not-cultura";
        excludeSourceIds?: string[];
        image?: "own" | "none";
      },
    ) => {
      if (startLane > lane || rows.length >= limit + 1) return;
      if (sourceIds && sourceIds.length === 0) return;
      const slice = await this.fetchFeedSlice(
        {
          ...params,
          prioritizeSourceSlugs: undefined,
          leadSourceSlugs: undefined,
          cursor: lane === startLane ? params.cursor : undefined,
        },
        limit + 1 - rows.length,
        { sourceIds, ...options },
      );
      rows.push(...slice);
    };

    const pullCulture = async (lane: FeedLane, image: "own" | "none") => {
      if (startLane > lane || rows.length >= limit + 1) return;
      const need = limit + 1 - rows.length;
      const cursor = lane === startLane ? params.cursor : undefined;
      const base = { ...params, prioritizeSourceSlugs: undefined, leadSourceSlugs: undefined, cursor };
      const [culturaRows, leadRows] = await Promise.all([
        this.fetchFeedSlice(base, need, { sourceIds: homeIds, category: "cultura", image }),
        leadIds.length > 0
          ? this.fetchFeedSlice(base, need, { sourceIds: leadIds, image })
          : Promise.resolve([]),
      ]);
      rows.push(...mergeFeedRows([...culturaRows, ...leadRows]).slice(0, need));
    };

    await pullCulture(0, "own");
    await pull(1, otherHomeIds, { category: "not-cultura", image: "own" });
    await pullCulture(2, "none");
    await pull(3, otherHomeIds, { category: "not-cultura", image: "none" });
    if (worldIds) {
      await pull(4, worldIds, { image: "own" });
      await pull(5, worldIds, { image: "none" });
    } else {
      await pull(4, undefined, { excludeSourceIds: homeIds, image: "own" });
      await pull(5, undefined, { excludeSourceIds: homeIds, image: "none" });
    }

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const heroMediaIds = pageRows
      .map((row) => row.hero_media_id)
      .filter((id): id is string => Boolean(id));
    const heroUrlByMediaId = await this.loadHeroImageUrls(heroMediaIds);
    const items = pageRows.map((row) => this.toFeedRecord(row, heroUrlByMediaId));
    const last = pageRows.at(-1);

    return {
      items,
      ...(hasMore && last
        ? {
            nextCursor: {
              publishedAt: last.published_at,
              ingestedAt: last.ingested_at,
              id: last.id as ArticleId,
              lane: resolveFeedLane(
                last.sources.slug,
                last.category_slug ?? "general",
                homeSlugs,
                leadSlugs,
                Boolean(last.hero_media_id),
              ),
            },
          }
        : {}),
      hasMore,
    };
  }

  private async fetchFeedSlice(
    params: ListFeedArticlesParams,
    take: number,
    lane: {
      sourceIds?: string[];
      excludeSourceIds?: string[];
      category?: "cultura" | "not-cultura";
      image?: "own" | "none";
    },
  ): Promise<ArticleWithSourceRow[]> {
    if (take <= 0) return [];
    if (lane.sourceIds && lane.sourceIds.length === 0) return [];

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

    if (lane.image === "own") {
      query = query.not("hero_media_id", "is", null);
    } else if (lane.image === "none") {
      query = query.is("hero_media_id", null);
    }

    if (lane.sourceIds) {
      query = query.in("source_id", lane.sourceIds);
    }

    if (lane.excludeSourceIds && lane.excludeSourceIds.length > 0) {
      query = query.not("source_id", "in", `(${lane.excludeSourceIds.join(",")})`);
    }

    if (excludeSourceIds && excludeSourceIds.length > 0) {
      query = query.not("source_id", "in", `(${excludeSourceIds.join(",")})`);
    }

    if (params.languageCodes && params.languageCodes.length > 0) {
      query = query.in("languages.code", [...params.languageCodes]);
    }

    if (lane.category === "cultura") {
      query = query.eq("category_slug", "cultura");
    } else if (lane.category === "not-cultura") {
      query = query.neq("category_slug", "cultura");
    } else if (params.categorySlug) {
      const slugs = getTopicSlugsForFilter(params.categorySlug);
      if (slugs.length === 1) {
        query = query.eq("category_slug", slugs[0]!);
      } else if (slugs.length > 1) {
        query = query.in("category_slug", slugs);
      }
    } else if (params.categorySlugs && params.categorySlugs.length > 0) {
      query = query.in("category_slug", [...params.categorySlugs]);
    }

    const search = params.search?.trim();
    if (search) {
      const pattern = `%${escapeIlikePattern(search)}%`;
      query = query.or(`title.ilike.${pattern},excerpt.ilike.${pattern}`);
    }

    if (params.publishedSince) {
      query = query.gte("published_at", params.publishedSince);
    }

    if (params.publishedBefore) {
      query = query.lt("published_at", params.publishedBefore);
    }

    if (params.cursor) {
      const { publishedAt, ingestedAt, id } = params.cursor;
      query = query.or(
        `published_at.lt.${publishedAt},and(published_at.eq.${publishedAt},ingested_at.lt.${ingestedAt}),and(published_at.eq.${publishedAt},ingested_at.eq.${ingestedAt},id.lt.${id})`,
      );
    }

    const { data, error } = await query
      .order("published_at", { ascending: false })
      .order("ingested_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(take);

    if (error) {
      throw new Error(`Failed to list feed articles: ${error.message}`);
    }

    return (data ?? []) as ArticleWithSourceRow[];
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

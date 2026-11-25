import { randomUUID } from "node:crypto";

import type { Article } from "@/domain/content/article";
import type { ArticleId, LanguageId, MediaId, ReferenceId } from "@/domain/shared/ids";
import {
  getTopicSlugsForFilter,
  parseCategorySlug,
} from "@/features/news/classification/categories";
import { createPostgresPool } from "@/lib/postgres";
import { resolveFeedLane } from "@/lib/repositories/contracts/feed-lane";
import type {
  ArticleDetailRecord,
  ArticleFeedRecord,
  ArticlePersistInput,
  ArticlePersistResult,
  ArticleRepository,
  ListFeedArticlesParams,
  ListFeedArticlesResult,
  ListPublishedForSitemapParams,
  ListPublishedForSitemapResult,
  SitemapArticleRecord,
} from "@/lib/repositories/contracts/article-repository";
import { resolveLanguageCode } from "@/lib/repositories/supabase/supabase-article-repository";
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

const FEED_STATUSES = ["ingested", "published"] as const;

type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
type MediaRow = Database["public"]["Tables"]["media"]["Row"];
type ReferenceRow = Database["public"]["Tables"]["article_references"]["Row"];

type FeedRow = ArticleRow & {
  source_name: string;
  source_slug: string;
  source_attribution_name: string;
  language_code: string | null;
};

type DetailRow = ArticleRow & {
  source_id_joined: string;
  source_slug: string;
  source_name: string;
  source_attribution_name: string;
  source_homepage_url: string;
  language_code: string | null;
};

type SitemapRow = {
  id: string;
  slug: string;
  title: string;
  published_at: string;
  ingested_at: string;
  category_slug: string;
  source_slug: string;
  language_code: string | null;
};

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

function languageFromCode(code: string | null): string {
  return resolveLanguageCode({ languages: code ? { code } : null });
}

export class PostgresArticleRepository implements ArticleRepository {
  async findByUrlFingerprint(urlFingerprint: string): Promise<Article | null> {
    const { rows } = await createPostgresPool().query<ArticleRow>(
      "SELECT * FROM articles WHERE url_fingerprint = $1 LIMIT 1",
      [urlFingerprint],
    );
    const row = rows[0];
    return row ? mapArticleRow(row) : null;
  }

  async findBySlug(slug: string): Promise<ArticleDetailRecord | null> {
    const { rows } = await createPostgresPool().query<DetailRow>(
      `
      SELECT
        a.*,
        s.id AS source_id_joined,
        s.slug AS source_slug,
        s.name AS source_name,
        s.attribution_name AS source_attribution_name,
        s.homepage_url AS source_homepage_url,
        l.code AS language_code
      FROM articles a
      INNER JOIN sources s ON s.id = a.source_id
      LEFT JOIN languages l ON l.id = a.language_id
      WHERE a.slug = $1
        AND a.status = ANY($2::text[])
      LIMIT 1
      `,
      [slug, [...FEED_STATUSES]],
    );

    const row = rows[0];
    if (!row) return null;

    let heroMedia: ReturnType<typeof mapMediaRow> | undefined;
    if (row.hero_media_id) {
      const media = await createPostgresPool().query<MediaRow>(
        "SELECT * FROM media WHERE id = $1 LIMIT 1",
        [row.hero_media_id],
      );
      if (media.rows[0]) {
        heroMedia = mapMediaRow(media.rows[0]);
      }
    }

    const references = await createPostgresPool().query<ReferenceRow>(
      "SELECT * FROM article_references WHERE article_id = $1",
      [row.id],
    );

    const source = mapSourceRow({
      id: row.source_id_joined,
      slug: row.source_slug,
      name: row.source_name,
      homepage_url: row.source_homepage_url,
      feed_url: null,
      logo_media_id: null,
      default_language_id: null,
      country_id: null,
      trust_tier: "unrated",
      status: "active",
      attribution_name: row.source_attribution_name,
      created_at: row.published_at,
      updated_at: row.published_at,
    });

    return {
      article: mapArticleRow(row),
      categorySlug: parseCategorySlug(row.category_slug) ?? "general",
      languageCode: languageFromCode(row.language_code),
      source: {
        id: source.id,
        slug: source.slug,
        name: source.name,
        attributionName: source.attributionName,
        homepageUrl: source.homepageUrl,
      },
      references: references.rows.map(mapReferenceRow),
      ...(heroMedia ? { heroMedia } : {}),
    };
  }

  async listPublishedForSitemap(
    params: ListPublishedForSitemapParams,
  ): Promise<ListPublishedForSitemapResult> {
    const limit = Math.max(1, Math.min(params.limit, 500));
    const values: unknown[] = [[...FEED_STATUSES]];
    let cursorSql = "";

    if (params.cursor) {
      values.push(params.cursor.publishedAt, params.cursor.ingestedAt, params.cursor.id);
      cursorSql = `
        AND (
          a.published_at < $2::timestamptz
          OR (a.published_at = $2::timestamptz AND a.ingested_at < $3::timestamptz)
          OR (a.published_at = $2::timestamptz AND a.ingested_at = $3::timestamptz AND a.id < $4::uuid)
        )
      `;
    }

    values.push(limit + 1);
    const limitIndex = values.length;

    const { rows } = await createPostgresPool().query<SitemapRow>(
      `
      SELECT
        a.id,
        a.slug,
        a.title,
        a.published_at,
        a.ingested_at,
        a.category_slug,
        s.slug AS source_slug,
        l.code AS language_code
      FROM articles a
      INNER JOIN sources s ON s.id = a.source_id
      LEFT JOIN languages l ON l.id = a.language_id
      WHERE a.status = ANY($1::text[])
      ${cursorSql}
      ORDER BY a.published_at DESC, a.ingested_at DESC, a.id DESC
      LIMIT $${limitIndex}
      `,
      values,
    );

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const last = pageRows.at(-1);

    return {
      items: pageRows.map((row) => ({
        slug: row.slug,
        title: row.title,
        publishedAt: row.published_at,
        sourceSlug: row.source_slug,
        categorySlug: parseCategorySlug(row.category_slug) ?? "general",
        languageCode: languageFromCode(row.language_code),
      })) satisfies SitemapArticleRecord[],
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

  async listForFeed(params: ListFeedArticlesParams): Promise<ListFeedArticlesResult> {
    const limit = Math.max(1, Math.min(params.limit, 50));
    const values: unknown[] = [[...FEED_STATUSES]];
    const filters: string[] = ["a.status = ANY($1::text[])"];

    if (params.sourceSlugs && params.sourceSlugs.length > 0) {
      values.push([...params.sourceSlugs]);
      filters.push(`s.slug = ANY($${values.length}::text[])`);
    }

    if (params.excludeSourceSlugs && params.excludeSourceSlugs.length > 0) {
      values.push([...params.excludeSourceSlugs]);
      filters.push(`s.slug <> ALL($${values.length}::text[])`);
    }

    if (params.languageCodes && params.languageCodes.length > 0) {
      values.push([...params.languageCodes]);
      filters.push(`l.code = ANY($${values.length}::text[])`);
    }

    if (params.categorySlug) {
      const slugs = getTopicSlugsForFilter(params.categorySlug);
      if (slugs.length === 1) {
        values.push(slugs[0]);
        filters.push(`a.category_slug = $${values.length}`);
      } else if (slugs.length > 1) {
        values.push([...slugs]);
        filters.push(`a.category_slug = ANY($${values.length}::text[])`);
      }
    } else if (params.categorySlugs && params.categorySlugs.length > 0) {
      values.push([...params.categorySlugs]);
      filters.push(`a.category_slug = ANY($${values.length}::text[])`);
    }

    const search = params.search?.trim();
    if (search) {
      values.push(`%${escapeIlikePattern(search)}%`);
      filters.push(`(a.title ILIKE $${values.length} OR a.excerpt ILIKE $${values.length})`);
    }

    if (params.publishedSince) {
      values.push(params.publishedSince);
      filters.push(`a.published_at >= $${values.length}::timestamptz`);
    }

    if (params.publishedBefore) {
      values.push(params.publishedBefore);
      filters.push(`a.published_at < $${values.length}::timestamptz`);
    }

    const homeSlugs = [...(params.prioritizeSourceSlugs ?? [])];
    const leadSlugs = [...(params.leadSourceSlugs ?? [])].filter((slug) => homeSlugs.includes(slug));
    const prioritized = homeSlugs.length > 0;
    const leadExclusive = params.leadExclusive === true && leadSlugs.length > 0;
    let laneSql = "";
    if (prioritized) {
      values.push(homeSlugs);
      const homeIndex = values.length;
      values.push(leadSlugs.length > 0 ? leadSlugs : ["__none__"]);
      const leadIndex = values.length;
      laneSql = leadExclusive
        ? `CASE
        WHEN s.slug = ANY($${leadIndex}::text[]) AND a.hero_media_id IS NOT NULL THEN 0
        WHEN s.slug = ANY($${leadIndex}::text[]) THEN 1
        WHEN s.slug = ANY($${homeIndex}::text[]) AND a.hero_media_id IS NOT NULL THEN 2
        WHEN s.slug = ANY($${homeIndex}::text[]) THEN 3
        WHEN a.hero_media_id IS NOT NULL THEN 4
        ELSE 5
      END`
        : `CASE
        WHEN s.slug = ANY($${homeIndex}::text[]) AND (
          a.category_slug = 'cultura'
          OR s.slug = ANY($${leadIndex}::text[])
        ) AND a.hero_media_id IS NOT NULL THEN 0
        WHEN s.slug = ANY($${homeIndex}::text[]) AND a.hero_media_id IS NOT NULL THEN 1
        WHEN s.slug = ANY($${homeIndex}::text[]) AND (
          a.category_slug = 'cultura'
          OR s.slug = ANY($${leadIndex}::text[])
        ) THEN 2
        WHEN s.slug = ANY($${homeIndex}::text[]) THEN 3
        WHEN a.hero_media_id IS NOT NULL THEN 4
        ELSE 5
      END`;
    }

    const imageSql = `CASE WHEN a.hero_media_id IS NOT NULL THEN 0 ELSE 1 END`;
    const chronological = params.chronological === true && !prioritized;

    if (params.cursor) {
      values.push(params.cursor.publishedAt, params.cursor.ingestedAt, params.cursor.id);
      const published = values.length - 2;
      const ingested = values.length - 1;
      const id = values.length;
      const datePredicate = `(
        a.published_at < $${published}::timestamptz
        OR (a.published_at = $${published}::timestamptz AND a.ingested_at < $${ingested}::timestamptz)
        OR (a.published_at = $${published}::timestamptz AND a.ingested_at = $${ingested}::timestamptz AND a.id < $${id}::uuid)
      )`;
      if (prioritized && params.cursor.lane !== undefined) {
        values.push(params.cursor.lane);
        const laneIndex = values.length;
        filters.push(`(
          ${laneSql} > $${laneIndex}
          OR (${laneSql} = $${laneIndex} AND ${datePredicate})
        )`);
      } else if (!prioritized && !chronological && params.cursor.imageRank !== undefined) {
        values.push(params.cursor.imageRank);
        const imageIndex = values.length;
        filters.push(`(
          ${imageSql} > $${imageIndex}
          OR (${imageSql} = $${imageIndex} AND ${datePredicate})
        )`);
      } else {
        filters.push(datePredicate);
      }
    }

    values.push(limit + 1);
    const limitIndex = values.length;
    const orderBy = prioritized
      ? `${laneSql} ASC, a.published_at DESC, a.ingested_at DESC, a.id DESC`
      : chronological
        ? `a.published_at DESC, a.ingested_at DESC, a.id DESC`
        : `${imageSql} ASC, a.published_at DESC, a.ingested_at DESC, a.id DESC`;

    const { rows } = await createPostgresPool().query<FeedRow>(
      `
      SELECT
        a.*,
        s.name AS source_name,
        s.slug AS source_slug,
        s.attribution_name AS source_attribution_name,
        l.code AS language_code
      FROM articles a
      INNER JOIN sources s ON s.id = a.source_id
      LEFT JOIN languages l ON l.id = a.language_id
      WHERE ${filters.join(" AND ")}
      ORDER BY ${orderBy}
      LIMIT $${limitIndex}
      `,
      values,
    );

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const heroUrlByMediaId = await this.loadHeroImageUrls(
      pageRows.map((row) => row.hero_media_id).filter((id): id is string => Boolean(id)),
    );

    const last = pageRows.at(-1);
    return {
      items: pageRows.map((row) => this.toFeedRecord(row, heroUrlByMediaId)),
      ...(hasMore && last
        ? {
            nextCursor: {
              publishedAt: last.published_at,
              ingestedAt: last.ingested_at,
              id: last.id as ArticleId,
              ...(prioritized
                ? {
                    lane: resolveFeedLane(
                      last.source_slug,
                      last.category_slug ?? "general",
                      homeSlugs,
                      leadSlugs,
                      Boolean(last.hero_media_id),
                      leadExclusive,
                    ),
                  }
                : chronological
                  ? {}
                  : { imageRank: last.hero_media_id ? 0 : 1 }),
            },
          }
        : {}),
      hasMore,
    };
  }

  async save(input: ArticlePersistInput): Promise<ArticlePersistResult> {
    const existing = await this.findByUrlFingerprint(input.article.urlFingerprint);
    const created = !existing;
    const articleId = existing?.id ?? (randomUUID() as ArticleId);
    const heroMediaId = input.heroMedia ? (randomUUID() as MediaId) : undefined;
    const articleRow = toArticleInsertRow({
      id: articleId,
      sourceId: input.sourceId,
      languageId: input.languageId,
      categorySlug: input.categorySlug,
      article: input.article,
    });

    const client = await createPostgresPool().connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `
        INSERT INTO articles (
          id, source_id, language_id, slug, canonical_url, url_fingerprint,
          title, excerpt, body_excerpt, content_format, published_at, ingested_at,
          updated_at, status, paywall_original, byline, hero_media_id, category_slug
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        )
        ON CONFLICT (url_fingerprint) DO UPDATE SET
          source_id = EXCLUDED.source_id,
          language_id = EXCLUDED.language_id,
          slug = EXCLUDED.slug,
          canonical_url = EXCLUDED.canonical_url,
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          body_excerpt = EXCLUDED.body_excerpt,
          content_format = EXCLUDED.content_format,
          published_at = EXCLUDED.published_at,
          updated_at = EXCLUDED.updated_at,
          status = EXCLUDED.status,
          paywall_original = EXCLUDED.paywall_original,
          byline = EXCLUDED.byline,
          category_slug = EXCLUDED.category_slug
        `,
        [
          articleRow.id,
          articleRow.source_id,
          articleRow.language_id,
          articleRow.slug,
          articleRow.canonical_url,
          articleRow.url_fingerprint,
          articleRow.title,
          articleRow.excerpt,
          articleRow.body_excerpt ?? null,
          articleRow.content_format,
          articleRow.published_at,
          articleRow.ingested_at,
          articleRow.updated_at,
          articleRow.status,
          articleRow.paywall_original,
          articleRow.byline ?? null,
          articleRow.hero_media_id ?? null,
          articleRow.category_slug,
        ],
      );

      await client.query("DELETE FROM media WHERE article_id = $1", [articleId]);
      if (input.heroMedia && heroMediaId) {
        const mediaRow = toMediaInsertRow(input.heroMedia, articleId, heroMediaId);
        await client.query(
          `
          INSERT INTO media (
            id, article_id, kind, url, storage_key, mime_type, width, height,
            duration_ms, alt_text, credit, license
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `,
          [
            mediaRow.id,
            mediaRow.article_id,
            mediaRow.kind,
            mediaRow.url,
            mediaRow.storage_key ?? null,
            mediaRow.mime_type ?? null,
            mediaRow.width ?? null,
            mediaRow.height ?? null,
            mediaRow.duration_ms ?? null,
            mediaRow.alt_text ?? null,
            mediaRow.credit ?? null,
            mediaRow.license ?? null,
          ],
        );
        await client.query("UPDATE articles SET hero_media_id = $1 WHERE id = $2", [
          heroMediaId,
          articleId,
        ]);
      }

      await client.query("DELETE FROM article_references WHERE article_id = $1", [articleId]);
      for (const reference of input.references) {
        const refRow = toReferenceInsertRow(reference, articleId, randomUUID() as ReferenceId);
        await client.query(
          `
          INSERT INTO article_references (
            id, article_id, url, title, publisher_name, kind, accessed_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            refRow.id,
            refRow.article_id,
            refRow.url,
            refRow.title ?? null,
            refRow.publisher_name ?? null,
            refRow.kind,
            refRow.accessed_at ?? null,
          ],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      const message = error instanceof Error ? error.message : "unknown";
      throw new Error(`Failed to save article: ${message}`);
    } finally {
      client.release();
    }

    const refreshed = await this.findByUrlFingerprint(input.article.urlFingerprint);
    if (!refreshed) {
      throw new Error("Article missing after save.");
    }
    return { article: refreshed, created };
  }

  async resolveLanguageId(languageCode: string): Promise<LanguageId> {
    const normalized = languageCode.trim().toLowerCase().split("-")[0] ?? languageCode;
    const { rows } = await createPostgresPool().query<{ id: string }>(
      "SELECT id FROM languages WHERE code = $1 LIMIT 1",
      [normalized],
    );
    const row = rows[0];
    if (!row) {
      throw new Error(`Language "${normalized}" is not in catalog.`);
    }
    return toLanguageId(row.id);
  }

  private async loadHeroImageUrls(mediaIds: string[]): Promise<Map<string, string>> {
    if (mediaIds.length === 0) return new Map();
    const { rows } = await createPostgresPool().query<{ id: string; url: string }>(
      "SELECT id, url FROM media WHERE id = ANY($1::uuid[])",
      [mediaIds],
    );
    return new Map(rows.map((row) => [row.id, row.url]));
  }

  private toFeedRecord(
    row: FeedRow,
    heroUrlByMediaId: Map<string, string>,
  ): ArticleFeedRecord {
    const article = mapArticleRow(row);
    const heroImageUrl = row.hero_media_id
      ? heroUrlByMediaId.get(row.hero_media_id)
      : undefined;

    return {
      article,
      categorySlug: parseCategorySlug(row.category_slug) ?? "general",
      languageCode: languageFromCode(row.language_code),
      sourceName: row.source_name,
      sourceSlug: row.source_slug,
      sourceAttributionName: row.source_attribution_name,
      ...(heroImageUrl ? { heroImageUrl } : {}),
    };
  }
}

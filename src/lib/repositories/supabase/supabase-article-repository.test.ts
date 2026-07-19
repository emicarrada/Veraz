import { describe, expect, it, vi } from "vitest";

import type { Article } from "@/domain/content/article";
import type { ArticleId, LanguageId, SourceId } from "@/domain/shared/ids";
import type {
  ArticlePersistInput,
  ArticlePersistResult,
  ArticleRepository,
} from "@/lib/repositories/contracts/article-repository";
import { SupabaseArticleRepository } from "@/lib/repositories/supabase/supabase-article-repository";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type TableName = keyof Database["public"]["Tables"];

function createMockClient(state: {
  articles: Database["public"]["Tables"]["articles"]["Row"][];
  languages: Database["public"]["Tables"]["languages"]["Row"][];
  media: Database["public"]["Tables"]["media"]["Row"][];
  references: Database["public"]["Tables"]["article_references"]["Row"][];
}) {
  const from = vi.fn((table: TableName) => {
    const api = {
      select: vi.fn(() => api),
      eq: vi.fn((column: string, value: unknown) => {
        api._filters.push({ column, value });
        return api;
      }),
      maybeSingle: vi.fn(async () => {
        const rows = filterRows(state, table, api._filters);
        return { data: rows[0] ?? null, error: null };
      }),
      single: vi.fn(async () => {
        const rows = filterRows(state, table, api._filters);
        const row = rows[0];
        if (!row) return { data: null, error: { message: "not found" } };
        return { data: row, error: null };
      }),
      upsert: vi.fn((row: Record<string, unknown>) => {
        api._upsertRow = row;
        return api;
      }),
      insert: vi.fn((rows: Record<string, unknown> | Record<string, unknown>[]) => {
        const list = Array.isArray(rows) ? rows : [rows];
        if (table === "media") {
          state.media.push(...(list as Database["public"]["Tables"]["media"]["Row"][]));
        }
        if (table === "article_references") {
          state.references.push(
            ...(list as Database["public"]["Tables"]["article_references"]["Row"][]),
          );
        }
        return Promise.resolve({ error: null });
      }),
      update: vi.fn(() => api),
      delete: vi.fn(() => {
        if (table === "media") {
          const articleId = api._filters.find((f) => f.column === "article_id")?.value;
          state.media = state.media.filter((row) => row.article_id !== articleId);
        }
        if (table === "article_references") {
          const articleId = api._filters.find((f) => f.column === "article_id")?.value;
          state.references = state.references.filter((row) => row.article_id !== articleId);
        }
        return api;
      }),
      _filters: [] as Array<{ column: string; value: unknown }>,
      _upsertRow: null as Record<string, unknown> | null,
    };

    api.select.mockImplementation(() => {
      if (api._upsertRow && table === "articles") {
        const existingIndex = state.articles.findIndex(
          (row) => row.url_fingerprint === api._upsertRow?.url_fingerprint,
        );
        const saved = api._upsertRow as Database["public"]["Tables"]["articles"]["Row"];
        if (existingIndex >= 0) {
          state.articles[existingIndex] = {
            ...state.articles[existingIndex],
            ...saved,
            id: state.articles[existingIndex]!.id,
          };
        } else {
          state.articles.push(saved);
        }
      }
      return api;
    });

    return api;
  });

  return { from } as unknown as SupabaseClient<Database>;
}

function filterRows(
  state: {
    articles: Database["public"]["Tables"]["articles"]["Row"][];
    languages: Database["public"]["Tables"]["languages"]["Row"][];
    media: Database["public"]["Tables"]["media"]["Row"][];
    references: Database["public"]["Tables"]["article_references"]["Row"][];
  },
  table: TableName,
  filters: Array<{ column: string; value: unknown }>,
) {
  const tableRows =
    table === "article_references"
      ? state.references
      : table === "articles"
        ? state.articles
        : table === "languages"
          ? state.languages
          : state.media;

  return tableRows.filter((row) =>
    filters.every((filter) => row[filter.column as keyof typeof row] === filter.value),
  );
}

describe("SupabaseArticleRepository", () => {
  const languageId = "lang-en" as LanguageId;
  const sourceId = "source-1" as SourceId;

  const persistInput: ArticlePersistInput = {
    sourceId,
    languageId,
    categorySlug: "general",
    article: {
      slug: "sample-article-abc12345",
      canonicalUrl: "https://example.com/a",
      urlFingerprint: "fingerprint-1",
      title: "Sample",
      excerpt: "Excerpt",
      contentFormat: "text",
      publishedAt: "2026-07-16T12:00:00.000Z",
      ingestedAt: "2026-07-17T00:00:00.000Z",
      updatedAt: "2026-07-17T00:00:00.000Z",
      status: "ingested",
      paywallOriginal: false,
    },
    references: [
      {
        url: "https://example.com/a",
        kind: "original",
        title: "Sample",
      },
    ],
  };

  it("creates article on first save and reports created=true", async () => {
    const state = {
      articles: [] as Database["public"]["Tables"]["articles"]["Row"][],
      languages: [{ id: "lang-en", code: "en", name: "English" }],
      media: [] as Database["public"]["Tables"]["media"]["Row"][],
      references: [] as Database["public"]["Tables"]["article_references"]["Row"][],
    };

    const repository = new SupabaseArticleRepository(createMockClient(state));
    const result = await repository.save(persistInput);

    expect(result.created).toBe(true);
    expect(result.article.urlFingerprint).toBe("fingerprint-1");
    expect(state.articles).toHaveLength(1);
    expect(state.references).toHaveLength(1);
  });

  it("upserts by url_fingerprint without duplicating rows", async () => {
    const existingId = "article-existing" as ArticleId;
    const state = {
      articles: [
        {
          id: existingId,
          source_id: sourceId,
          slug: "old-slug",
          canonical_url: "https://example.com/a",
          url_fingerprint: "fingerprint-1",
          title: "Old title",
          excerpt: "Old",
          body_excerpt: null,
          content_format: "text",
          language_id: languageId,
          primary_country_id: null,
          published_at: "2026-07-16T12:00:00.000Z",
          ingested_at: "2026-07-16T12:00:00.000Z",
          updated_at: "2026-07-16T12:00:00.000Z",
          status: "ingested",
          paywall_original: false,
          hero_media_id: null,
          byline: null,
          category_slug: "general",
        },
      ],
      languages: [{ id: "lang-en", code: "en", name: "English" }],
      media: [],
      references: [],
    };

    const repository = new SupabaseArticleRepository(createMockClient(state));
    const result = await repository.save({
      ...persistInput,
      article: {
        ...persistInput.article,
        title: "Updated title",
      },
    });

    expect(result.created).toBe(false);
    expect(result.article.id).toBe(existingId);
    expect(state.articles).toHaveLength(1);
    expect(state.articles[0]?.title).toBe("Updated title");
  });

  it("resolves language code via languages catalog", async () => {
    const state = {
      articles: [],
      languages: [{ id: "lang-en", code: "en", name: "English" }],
      media: [],
      references: [],
    };

    const repository = new SupabaseArticleRepository(createMockClient(state));
    await expect(repository.resolveLanguageId("en-US")).resolves.toBe(languageId);
  });
});

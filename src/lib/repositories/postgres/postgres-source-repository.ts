import { randomUUID } from "node:crypto";

import type { Source } from "@/domain/catalog/source";
import type { LanguageId, SourceId } from "@/domain/shared/ids";
import type { Slug } from "@/domain/shared/value-objects";
import {
  mapSourceRow,
  toLanguageId,
} from "@/lib/repositories/supabase/row-mappers";
import type {
  EnsureRssSourceInput,
  SourceRepository,
} from "@/lib/repositories/contracts/source-repository";
import { createPostgresPool } from "@/lib/postgres";
import type { Database } from "@/lib/supabase/database.types";

type SourceRow = Database["public"]["Tables"]["sources"]["Row"];

export class PostgresSourceRepository implements SourceRepository {
  async findBySlug(slug: Slug): Promise<Source | null> {
    const { rows } = await createPostgresPool().query<SourceRow>(
      "SELECT * FROM sources WHERE slug = $1 LIMIT 1",
      [slug],
    );
    const row = rows[0];
    return row ? mapSourceRow(row) : null;
  }

  async ensureRssSource(input: EnsureRssSourceInput): Promise<Source> {
    const existing = await this.findBySlug(input.slug);
    const now = new Date().toISOString();
    const defaultLanguageId = await this.resolveLanguageId(input.defaultLanguageCode);
    const name = input.name?.trim() || humanizeSlug(input.slug);
    const homepageUrl = input.homepageUrl?.trim() || deriveHomepageFromFeed(input.feedUrl);
    const id = existing?.id ?? (randomUUID() as SourceId);

    const { rows } = await createPostgresPool().query<SourceRow>(
      `
      INSERT INTO sources (
        id, slug, name, homepage_url, feed_url, attribution_name,
        trust_tier, status, default_language_id, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'unrated', 'active', $7, $8, $9)
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        homepage_url = EXCLUDED.homepage_url,
        feed_url = EXCLUDED.feed_url,
        attribution_name = EXCLUDED.attribution_name,
        default_language_id = COALESCE(EXCLUDED.default_language_id, sources.default_language_id),
        status = 'active',
        updated_at = EXCLUDED.updated_at
      RETURNING *
      `,
      [
        id,
        input.slug,
        name,
        homepageUrl,
        input.feedUrl,
        name,
        defaultLanguageId ?? null,
        existing?.createdAt ?? now,
        now,
      ],
    );

    const row = rows[0];
    if (!row) {
      throw new Error("Failed to ensure RSS source: no row returned.");
    }
    return mapSourceRow(row);
  }

  private async resolveLanguageId(code?: string): Promise<LanguageId | undefined> {
    if (!code?.trim()) return undefined;
    const normalized = code.trim().toLowerCase().split("-")[0] ?? code;
    const { rows } = await createPostgresPool().query<{ id: string }>(
      "SELECT id FROM languages WHERE code = $1 LIMIT 1",
      [normalized],
    );
    return rows[0] ? toLanguageId(rows[0].id) : undefined;
  }
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function deriveHomepageFromFeed(feedUrl: string): string {
  try {
    const url = new URL(feedUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return feedUrl;
  }
}

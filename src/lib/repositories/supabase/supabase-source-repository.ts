import { randomUUID } from "node:crypto";

import type { Source } from "@/domain/catalog/source";
import type { LanguageId, SourceId } from "@/domain/shared/ids";
import type { Slug } from "@/domain/shared/value-objects";
import type {
  EnsureRssSourceInput,
  SourceRepository,
} from "@/lib/repositories/contracts/source-repository";
import {
  mapSourceRow,
  toLanguageId,
  toSourceId,
} from "@/lib/repositories/supabase/row-mappers";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseSourceRepository implements SourceRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findBySlug(slug: Slug): Promise<Source | null> {
    const { data, error } = await this.client
      .from("sources")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find source by slug: ${error.message}`);
    }

    return data ? mapSourceRow(data) : null;
  }

  async ensureRssSource(input: EnsureRssSourceInput): Promise<Source> {
    const existing = await this.findBySlug(input.slug);
    const now = new Date().toISOString();
    const defaultLanguageId = await this.resolveLanguageId(input.defaultLanguageCode);

    const name = input.name?.trim() || humanizeSlug(input.slug);
    const homepageUrl = input.homepageUrl?.trim() || deriveHomepageFromFeed(input.feedUrl);

    const row: Database["public"]["Tables"]["sources"]["Insert"] = {
      slug: input.slug,
      name,
      homepage_url: homepageUrl,
      feed_url: input.feedUrl,
      attribution_name: name,
      trust_tier: "unrated",
      status: "active",
      ...(defaultLanguageId ? { default_language_id: defaultLanguageId } : {}),
      ...(existing ? { id: existing.id, created_at: existing.createdAt, updated_at: now } : { updated_at: now }),
    };

    const { data, error } = await this.client
      .from("sources")
      .upsert(row, { onConflict: "slug" })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(`Failed to ensure RSS source: ${error?.message ?? "unknown"}`);
    }

    return mapSourceRow(data);
  }

  private async resolveLanguageId(code?: string): Promise<LanguageId | undefined> {
    if (!code?.trim()) return undefined;

    const normalized = code.trim().toLowerCase().split("-")[0] ?? code;
    const { data, error } = await this.client
      .from("languages")
      .select("id")
      .eq("code", normalized)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to resolve language "${normalized}": ${error.message}`);
    }

    return data ? toLanguageId(data.id) : undefined;
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

export function createSourceId(): SourceId {
  return randomUUID() as SourceId;
}

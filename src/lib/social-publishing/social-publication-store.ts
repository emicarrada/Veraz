import type { ArticleId } from "@/domain/shared/ids";
import type { Locale } from "@/i18n/routing";
import type {
  SocialPlatform,
  SocialPublicationStatus,
} from "@/features/social-publishing/types";
import { createPostgresPool, isPostgresPersistenceConfigured } from "@/lib/postgres";
import { createSupabaseAdminClient, isSupabasePersistenceConfigured } from "@/lib/supabase";
import { startOfTodayUtcIso } from "@/lib/social-publishing/publish-day-boundary";

export type SocialPublicationRow = {
  article_id: string;
  platform: SocialPlatform;
  locale: Locale;
  status: SocialPublicationStatus;
  export_path: string | null;
  caption: string | null;
  external_post_id: string | null;
  error_message: string | null;
};

function isPersistenceReady(): boolean {
  return isPostgresPersistenceConfigured() || isSupabasePersistenceConfigured();
}

function isUndefinedTableError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const code = "code" in error ? String(error.code) : "";
  const message = "message" in error ? String(error.message) : "";
  return code === "42P01" || message.includes("social_publications");
}

export async function loadPublicationIndex(): Promise<Map<string, Map<SocialPlatform, SocialPublicationStatus>>> {
  const index = new Map<string, Map<SocialPlatform, SocialPublicationStatus>>();
  if (!isPersistenceReady()) return index;

  try {
    if (isPostgresPersistenceConfigured()) {
      const { rows } = await createPostgresPool().query<{
        article_id: string;
        platform: SocialPlatform;
        status: SocialPublicationStatus;
      }>("SELECT article_id, platform, status FROM social_publications");
      for (const row of rows) {
        if (!index.has(row.article_id)) index.set(row.article_id, new Map());
        index.get(row.article_id)!.set(row.platform, row.status);
      }
      return index;
    }

    const client = createSupabaseAdminClient();
    const { data, error } = await client
      .from("social_publications")
      .select("article_id, platform, status");

    if (error) {
      if (isUndefinedTableError(error)) return index;
      throw new Error(`Failed to load social_publications: ${error.message}`);
    }

    for (const row of data ?? []) {
      const articleId = row.article_id as string;
      const platform = row.platform as SocialPlatform;
      const status = row.status as SocialPublicationStatus;
      if (!index.has(articleId)) index.set(articleId, new Map());
      index.get(articleId)!.set(platform, status);
    }
    return index;
  } catch (error) {
    if (isUndefinedTableError(error)) return index;
    throw error;
  }
}

export function articleNeedsPlatformWork(
  articleId: string,
  platforms: SocialPlatform[],
  index: Map<string, Map<SocialPlatform, SocialPublicationStatus>>,
): boolean {
  if (platforms.length === 0) return true;
  const byPlatform = index.get(articleId);
  return platforms.some((platform) => {
    const status = byPlatform?.get(platform);
    return status !== "posted" && status !== "delivered";
  });
}

export function pendingPlatformsForArticle(
  articleId: string,
  platforms: SocialPlatform[],
  index: Map<string, Map<SocialPlatform, SocialPublicationStatus>>,
): SocialPlatform[] {
  const byPlatform = index.get(articleId);
  return platforms.filter((platform) => {
    const status = byPlatform?.get(platform);
    return status !== "posted" && status !== "delivered";
  });
}

export async function upsertSocialPublication(input: {
  articleId: ArticleId;
  platform: SocialPlatform;
  locale: Locale;
  status: SocialPublicationStatus;
  exportPath?: string;
  caption?: string;
  externalPostId?: string;
  errorMessage?: string;
  markPosted?: boolean;
}): Promise<void> {
  if (!isPersistenceReady()) {
    throw new Error("Content persistence is not configured");
  }

  const postedAt = input.markPosted ? new Date().toISOString() : null;

  if (isPostgresPersistenceConfigured()) {
    await createPostgresPool().query(
      `
      INSERT INTO social_publications (
        article_id, platform, locale, status, export_path, caption,
        external_post_id, error_message, posted_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (article_id, platform) DO UPDATE SET
        locale = EXCLUDED.locale,
        status = EXCLUDED.status,
        export_path = EXCLUDED.export_path,
        caption = EXCLUDED.caption,
        external_post_id = EXCLUDED.external_post_id,
        error_message = EXCLUDED.error_message,
        posted_at = COALESCE(EXCLUDED.posted_at, social_publications.posted_at)
      `,
      [
        input.articleId,
        input.platform,
        input.locale,
        input.status,
        input.exportPath ?? null,
        input.caption ?? null,
        input.externalPostId ?? null,
        input.errorMessage ?? null,
        postedAt,
      ],
    );
    return;
  }

  const client = createSupabaseAdminClient();
  const row = {
    article_id: input.articleId,
    platform: input.platform,
    locale: input.locale,
    status: input.status,
    export_path: input.exportPath ?? null,
    caption: input.caption ?? null,
    external_post_id: input.externalPostId ?? null,
    error_message: input.errorMessage ?? null,
    ...(input.markPosted ? { posted_at: new Date().toISOString() } : {}),
  };

  const { error } = await client.from("social_publications").upsert(row, {
    onConflict: "article_id,platform",
  });

  if (error) {
    throw new Error(`Failed to upsert social_publications: ${error.message}`);
  }
}

async function countByStatusToday(
  platform: SocialPlatform,
  timeZone: string,
  status: "posted" | "delivered",
): Promise<number> {
  if (!isPersistenceReady()) return 0;
  const since = startOfTodayUtcIso(timeZone);

  if (isPostgresPersistenceConfigured()) {
    const { rows } = await createPostgresPool().query<{ count: string }>(
      `
      SELECT COUNT(*)::text AS count
      FROM social_publications
      WHERE platform = $1 AND status = $2 AND posted_at >= $3::timestamptz
      `,
      [platform, status, since],
    );
    return Number(rows[0]?.count ?? 0);
  }

  const client = createSupabaseAdminClient();
  const { count, error } = await client
    .from("social_publications")
    .select("*", { count: "exact", head: true })
    .eq("platform", platform)
    .eq("status", status)
    .gte("posted_at", since);

  if (error) {
    throw new Error(`Failed to count social_publications: ${error.message}`);
  }
  return count ?? 0;
}

export async function countPostedToday(
  platform: SocialPlatform,
  timeZone: string,
): Promise<number> {
  return countByStatusToday(platform, timeZone, "posted");
}

export async function countDeliveredToday(
  platform: SocialPlatform,
  timeZone: string,
): Promise<number> {
  return countByStatusToday(platform, timeZone, "delivered");
}

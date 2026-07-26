import type { ArticleId } from "@/domain/shared/ids";
import type { Locale } from "@/i18n/routing";
import type {
  SocialPlatform,
  SocialPublicationStatus,
} from "@/features/social-publishing/types";
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

export async function loadPublicationIndex(): Promise<Map<string, Map<SocialPlatform, SocialPublicationStatus>>> {
  const index = new Map<string, Map<SocialPlatform, SocialPublicationStatus>>();
  if (!isSupabasePersistenceConfigured()) return index;

  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("social_publications")
    .select("article_id, platform, status");

  if (error) {
    if (error.message.includes("social_publications") || error.code === "42P01") {
      return index;
    }
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
}

export function articleNeedsPlatformWork(
  articleId: string,
  platforms: SocialPlatform[],
  index: Map<string, Map<SocialPlatform, SocialPublicationStatus>>,
): boolean {
  if (platforms.length === 0) return true;
  const byPlatform = index.get(articleId);
  return platforms.some((platform) => byPlatform?.get(platform) !== "posted");
}

export function pendingPlatformsForArticle(
  articleId: string,
  platforms: SocialPlatform[],
  index: Map<string, Map<SocialPlatform, SocialPublicationStatus>>,
): SocialPlatform[] {
  const byPlatform = index.get(articleId);
  return platforms.filter((platform) => byPlatform?.get(platform) !== "posted");
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
  if (!isSupabasePersistenceConfigured()) {
    throw new Error("Supabase not configured");
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

export async function countPostedToday(
  platform: SocialPlatform,
  timeZone: string,
): Promise<number> {
  if (!isSupabasePersistenceConfigured()) return 0;

  const client = createSupabaseAdminClient();
  const since = startOfTodayUtcIso(timeZone);
  const { count, error } = await client
    .from("social_publications")
    .select("*", { count: "exact", head: true })
    .eq("platform", platform)
    .eq("status", "posted")
    .gte("posted_at", since);

  if (error) {
    throw new Error(`Failed to count social_publications: ${error.message}`);
  }
  return count ?? 0;
}

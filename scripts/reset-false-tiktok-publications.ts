#!/usr/bin/env npx tsx
/**
 * Reset tiktok rows marked posted so publish can retry (e.g. false positive).
 * Usage: npm run social:reset-tiktok-false-posts
 */
import { createPostgresPool, isPostgresPersistenceConfigured } from "@/lib/postgres";
import { createSupabaseAdminClient, isSupabasePersistenceConfigured } from "@/lib/supabase";

async function main(): Promise<void> {
  if (isPostgresPersistenceConfigured()) {
    const result = await createPostgresPool().query<{ article_id: string }>(
      `
      UPDATE social_publications
      SET status = 'failed',
          error_message = 'Reset for retry (manual false-post cleanup)'
      WHERE platform = 'tiktok' AND status = 'posted'
      RETURNING article_id
      `,
    );
    console.log(`Reset ${result.rowCount ?? 0} tiktok publication(s) to failed for retry.`);
    return;
  }

  if (!isSupabasePersistenceConfigured()) {
    console.error("Content persistence is not configured.");
    process.exit(1);
  }

  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("social_publications")
    .update({ status: "failed", error_message: "Reset for retry (manual false-post cleanup)" })
    .eq("platform", "tiktok")
    .eq("status", "posted")
    .select("article_id");

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  console.log(`Reset ${data?.length ?? 0} tiktok publication(s) to failed for retry.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

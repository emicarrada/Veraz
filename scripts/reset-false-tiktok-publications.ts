#!/usr/bin/env npx tsx
/**
 * Reset tiktok rows marked posted so publish can retry (e.g. false positive).
 * Usage: npm run social:reset-tiktok-false-posts
 */
import { createSupabaseAdminClient, isSupabasePersistenceConfigured } from "@/lib/supabase";

async function main(): Promise<void> {
  if (!isSupabasePersistenceConfigured()) {
    console.error("Supabase not configured.");
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

#!/usr/bin/env tsx
/**
 * Read-only feed diagnostics — run with: npx tsx scripts/diagnose-feed.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env.
 */
import {
  PRESTIGIOUS_FINANCE_SOURCES,
  PRESTIGIOUS_TECH_SOURCES,
} from "@/features/news/config/prestigious-sources";
import { createSupabaseAdminClient, isSupabasePersistenceConfigured } from "@/lib/supabase";

const FEED_STATUSES = ["ingested", "published"] as const;

type ArticleLanguageJoinRow = {
  id: string;
  language_id: string;
  languages: { code: string } | null;
};

async function main(): Promise<void> {
  if (!isSupabasePersistenceConfigured()) {
    console.error("Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const client = createSupabaseAdminClient();

  const { count: visibleCount, error: visibleError } = await client
    .from("articles")
    .select("*", { count: "exact", head: true })
    .in("status", [...FEED_STATUSES]);

  if (visibleError) {
    console.error("Failed to count visible articles:", visibleError.message);
    process.exit(1);
  }

  const { data: statusRows, error: statusError } = await client
    .from("articles")
    .select("status");

  if (statusError) {
    console.error("Failed to load article statuses:", statusError.message);
    process.exit(1);
  }

  const statusCounts = new Map<string, number>();
  for (const row of statusRows ?? []) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
  }

  const { data: rawArticles, error: joinError } = await client
    .from("articles")
    .select("id, language_id, languages(code)")
    .in("status", [...FEED_STATUSES]);

  let orphanCount = 0;
  if (joinError) {
    console.warn("Could not check language join:", joinError.message);
  } else {
    const articles = (rawArticles ?? []) as ArticleLanguageJoinRow[];
    orphanCount = articles.filter((row) => !row.languages?.code).length;
  }

  const prestigiousSlugs = [
    ...PRESTIGIOUS_FINANCE_SOURCES.map((s) => s.slug),
    ...PRESTIGIOUS_TECH_SOURCES.map((s) => s.slug),
  ];

  const { data: sourceRows, error: sourceError } = await client
    .from("sources")
    .select("slug")
    .in("slug", prestigiousSlugs);

  if (sourceError) {
    console.error("Failed to load prestigious sources:", sourceError.message);
    process.exit(1);
  }

  const foundSlugs = new Set((sourceRows ?? []).map((row) => row.slug));
  const missingSlugs = prestigiousSlugs.filter((slug) => !foundSlugs.has(slug));

  const { data: langRows, error: langError } = await client.from("languages").select("code");

  if (langError) {
    console.error("Failed to load languages catalog:", langError.message);
    process.exit(1);
  }

  const { data: enArticles, error: enError } = await client
    .from("articles")
    .select("id, languages!inner(code)")
    .in("status", [...FEED_STATUSES])
    .eq("languages.code", "en");

  if (enError) {
    console.warn("Could not count EN articles:", enError.message);
  }

  const { data: translationTable, error: translationError } = await client
    .from("article_translations")
    .select("article_id")
    .limit(1);

  const hasTranslationsTable = !translationError;

  console.log("\n=== Veraz feed diagnostics ===\n");
  console.log(`Visible feed articles (ingested|published): ${visibleCount ?? 0}`);
  console.log("Articles by status:");
  for (const [status, count] of [...statusCounts.entries()].sort()) {
    console.log(`  ${status}: ${count}`);
  }
  console.log(`Articles with broken language join: ${orphanCount}`);
  console.log(`Languages in catalog: ${(langRows ?? []).map((r) => r.code).join(", ") || "(none)"}`);
  console.log(`English articles in feed: ${enError ? "unknown" : (enArticles ?? []).length}`);
  console.log(`article_translations table: ${hasTranslationsTable ? "present" : "MISSING — run migration 20250721120000"}`);
  if (missingSlugs.length > 0) {
    console.log(`Missing prestigious source slugs in DB: ${missingSlugs.join(", ")}`);
  } else {
    console.log("All prestigious source slugs found in DB.");
  }

  if ((visibleCount ?? 0) === 0) {
    console.log("\nHint: run `npm run ingest:run` after configuring NEWS_RSS_FEEDS.");
  }
  if (orphanCount > 0) {
    console.log("\nHint: run `npx tsx scripts/backfill-article-language.ts` to fix language_id.");
  }

  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

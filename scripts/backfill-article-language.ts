#!/usr/bin/env tsx
/**
 * Backfill articles.language_id from sources.default_language_id or catalog defaultLanguageCode.
 * Run once after fixing ingestion language assignment: npx tsx scripts/backfill-article-language.ts
 */
import { RSS_FEED_CATALOG } from "@/config/domains/rss-feed-catalog";
import { createSupabaseAdminClient, isSupabasePersistenceConfigured } from "@/lib/supabase";

const FEED_STATUSES = ["ingested", "published"] as const;

type ArticleLanguageRow = {
  id: string;
  language_id: string;
  languages: { code: string } | null;
  sources: { slug: string; default_language_id: string | null };
};

const CATALOG_LANGUAGE_BY_SLUG = new Map(
  RSS_FEED_CATALOG.map((entry) => [entry.sourceSlug, entry.defaultLanguageCode ?? "es"]),
);

async function main(): Promise<void> {
  if (!isSupabasePersistenceConfigured()) {
    console.error("Supabase not configured.");
    process.exit(1);
  }

  const client = createSupabaseAdminClient();

  const { data: languages, error: langError } = await client.from("languages").select("id, code");

  if (langError || !languages?.length) {
    console.error("Failed to load languages catalog:", langError?.message);
    process.exit(1);
  }

  const languageIdByCode = new Map(languages.map((row) => [row.code, row.id]));

  const { data: rawArticles, error: articlesError } = await client
    .from("articles")
    .select(
      `
      id,
      language_id,
      languages ( code ),
      sources!inner ( slug, default_language_id )
    `,
    )
    .in("status", [...FEED_STATUSES]);

  if (articlesError) {
    console.error("Failed to load articles:", articlesError.message);
    process.exit(1);
  }

  const articles = (rawArticles ?? []) as ArticleLanguageRow[];

  let updated = 0;
  let skipped = 0;

  for (const row of articles) {
    const source = row.sources;
    const currentLang = row.languages?.code;

    let targetCode = currentLang?.trim().toLowerCase().split("-")[0];

    if (!targetCode || targetCode === "es") {
      if (source.default_language_id) {
        const sourceLang = languages.find((l) => l.id === source.default_language_id);
        if (sourceLang) targetCode = sourceLang.code;
      }
    }

    if (!targetCode || targetCode === "es") {
      const catalogCode = CATALOG_LANGUAGE_BY_SLUG.get(source.slug);
      if (catalogCode) targetCode = catalogCode;
    }

    if (!targetCode) {
      skipped += 1;
      continue;
    }

    const targetLanguageId = languageIdByCode.get(targetCode);
    if (!targetLanguageId || targetLanguageId === row.language_id) {
      skipped += 1;
      continue;
    }

    const { error: updateError } = await client
      .from("articles")
      .update({ language_id: targetLanguageId })
      .eq("id", row.id);

    if (updateError) {
      console.warn(`Failed to update article ${row.id}:`, updateError.message);
      skipped += 1;
      continue;
    }

    updated += 1;
  }

  console.log(`Backfill complete. Updated: ${updated}, skipped: ${skipped}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

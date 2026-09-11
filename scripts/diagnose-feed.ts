#!/usr/bin/env tsx
/**
 * Read-only feed diagnostics — run with: npm run diagnose:feed
 * Requires DATABASE_URL, or legacy Supabase env vars.
 */
import {
  PRESTIGIOUS_FINANCE_SOURCES,
  PRESTIGIOUS_TECH_SOURCES,
} from "@/features/news/config/prestigious-sources";
import { createPostgresPool, isPostgresPersistenceConfigured } from "@/lib/postgres";
import { createSupabaseAdminClient, isSupabasePersistenceConfigured } from "@/lib/supabase";

const FEED_STATUSES = ["ingested", "published"] as const;

type ArticleLanguageJoinRow = {
  id: string;
  language_id: string;
  languages: { code: string } | null;
};

async function diagnosePostgres(): Promise<void> {
  const pool = createPostgresPool();
  const visible = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM articles WHERE status = ANY($1::text[])",
    [[...FEED_STATUSES]],
  );
  const statuses = await pool.query<{ status: string; count: string }>(
    "SELECT status, COUNT(*)::text AS count FROM articles GROUP BY status ORDER BY status",
  );
  const orphans = await pool.query<{ count: string }>(
    `
    SELECT COUNT(*)::text AS count
    FROM articles a
    LEFT JOIN languages l ON l.id = a.language_id
    WHERE a.status = ANY($1::text[]) AND l.code IS NULL
    `,
    [[...FEED_STATUSES]],
  );
  const languages = await pool.query<{ code: string }>("SELECT code FROM languages ORDER BY code");
  const english = await pool.query<{ count: string }>(
    `
    SELECT COUNT(*)::text AS count
    FROM articles a
    INNER JOIN languages l ON l.id = a.language_id
    WHERE a.status = ANY($1::text[]) AND l.code = 'en'
    `,
    [[...FEED_STATUSES]],
  );
  const translations = await pool.query(
    "SELECT 1 FROM information_schema.tables WHERE table_name = 'article_translations'",
  );

  const prestigiousSlugs = [
    ...PRESTIGIOUS_FINANCE_SOURCES.map((s) => s.slug),
    ...PRESTIGIOUS_TECH_SOURCES.map((s) => s.slug),
  ];
  const sources = await pool.query<{ slug: string }>(
    "SELECT slug FROM sources WHERE slug = ANY($1::text[])",
    [prestigiousSlugs],
  );
  const foundSlugs = new Set(sources.rows.map((row) => row.slug));
  const missingSlugs = prestigiousSlugs.filter((slug) => !foundSlugs.has(slug));

  printDiagnostics({
    visibleCount: Number(visible.rows[0]?.count ?? 0),
    statusCounts: statuses.rows.map((row) => [row.status, Number(row.count)] as const),
    orphanCount: Number(orphans.rows[0]?.count ?? 0),
    languageCodes: languages.rows.map((row) => row.code),
    englishCount: Number(english.rows[0]?.count ?? 0),
    hasTranslationsTable: (translations.rowCount ?? 0) > 0,
    missingSlugs,
  });
}

async function diagnoseSupabase(): Promise<void> {
  const client = createSupabaseAdminClient();

  const { count: visibleCount, error: visibleError } = await client
    .from("articles")
    .select("*", { count: "exact", head: true })
    .in("status", [...FEED_STATUSES]);

  if (visibleError) {
    throw new Error(`Failed to count visible articles: ${visibleError.message}`);
  }

  const { data: statusRows, error: statusError } = await client.from("articles").select("status");
  if (statusError) {
    throw new Error(`Failed to load article statuses: ${statusError.message}`);
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
    throw new Error(`Failed to load prestigious sources: ${sourceError.message}`);
  }

  const foundSlugs = new Set((sourceRows ?? []).map((row) => row.slug));
  const missingSlugs = prestigiousSlugs.filter((slug) => !foundSlugs.has(slug));

  const { data: langRows, error: langError } = await client.from("languages").select("code");
  if (langError) {
    throw new Error(`Failed to load languages catalog: ${langError.message}`);
  }

  const { data: enArticles, error: enError } = await client
    .from("articles")
    .select("id, languages!inner(code)")
    .in("status", [...FEED_STATUSES])
    .eq("languages.code", "en");

  if (enError) {
    console.warn("Could not count EN articles:", enError.message);
  }

  const { error: translationError } = await client
    .from("article_translations")
    .select("article_id")
    .limit(1);

  printDiagnostics({
    visibleCount: visibleCount ?? 0,
    statusCounts: [...statusCounts.entries()].sort(),
    orphanCount,
    languageCodes: (langRows ?? []).map((row) => row.code),
    englishCount: enError ? undefined : (enArticles ?? []).length,
    hasTranslationsTable: !translationError,
    missingSlugs,
  });
}

function printDiagnostics(input: {
  visibleCount: number;
  statusCounts: ReadonlyArray<readonly [string, number]>;
  orphanCount: number;
  languageCodes: string[];
  englishCount?: number;
  hasTranslationsTable: boolean;
  missingSlugs: string[];
}): void {
  console.log("\n=== Veraz feed diagnostics ===\n");
  console.log(`Visible feed articles (ingested|published): ${input.visibleCount}`);
  console.log("Articles by status:");
  for (const [status, count] of input.statusCounts) {
    console.log(`  ${status}: ${count}`);
  }
  console.log(`Articles with broken language join: ${input.orphanCount}`);
  console.log(`Languages in catalog: ${input.languageCodes.join(", ") || "(none)"}`);
  console.log(`English articles in feed: ${input.englishCount ?? "unknown"}`);
  console.log(
    `article_translations table: ${
      input.hasTranslationsTable ? "present" : "MISSING — run npm run db:migrate"
    }`,
  );
  if (input.missingSlugs.length > 0) {
    console.log(`Missing prestigious source slugs in DB: ${input.missingSlugs.join(", ")}`);
  } else {
    console.log("All prestigious source slugs found in DB.");
  }

  if (input.visibleCount === 0) {
    console.log("\nHint: run `npm run ingest:run` after configuring NEWS_RSS_FEEDS.");
  }
  if (input.orphanCount > 0) {
    console.log("\nHint: run `npx tsx scripts/backfill-article-language.ts` to fix language_id.");
  }
  console.log("");
}

async function main(): Promise<void> {
  if (isPostgresPersistenceConfigured()) {
    await diagnosePostgres();
    return;
  }
  if (!isSupabasePersistenceConfigured()) {
    console.error("Set DATABASE_URL, or NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }
  await diagnoseSupabase();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

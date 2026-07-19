#!/usr/bin/env node
/**
 * Smoke-test all feeds in RSS_FEED_CATALOG.
 * Usage: npm run feeds:validate
 */
import { RSS_FEED_CATALOG, type RssFeedCatalogEntry } from "@/config/domains/rss-feed-catalog";

const USER_AGENT = "Veraz-RSS-Ingestion/1.0";
const TIMEOUT_MS = 20_000;

type ValidationResult = {
  sourceSlug: string;
  status: number;
  itemCount: number;
  ok: boolean;
  error?: string;
};

async function validateFeed(entry: RssFeedCatalogEntry): Promise<ValidationResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(entry.feedUrl, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml, application/atom+xml, */*" },
      signal: controller.signal,
    });

    const body = await response.text();
    const itemCount =
      (body.match(/<item[\s>]/gi) ?? []).length +
      (body.match(/<entry[\s>]/gi) ?? []).length;

    const ok = response.ok && itemCount > 0;
    return {
      sourceSlug: entry.sourceSlug,
      status: response.status,
      itemCount,
      ok,
      error: ok ? undefined : `HTTP ${response.status} or no items (${itemCount})`,
    };
  } catch (error) {
    return {
      sourceSlug: entry.sourceSlug,
      status: 0,
      itemCount: 0,
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const results = await Promise.all(RSS_FEED_CATALOG.map(validateFeed));
  const failed = results.filter((result) => !result.ok);

  for (const result of results) {
    const label = result.ok ? "OK" : "FAIL";
    console.log(
      `[${label}] ${result.sourceSlug} — ${result.status} — ${result.itemCount} items` +
        (result.error ? ` — ${result.error}` : ""),
    );
  }

  if (failed.length > 0) {
    console.error(`\n${failed.length} feed(s) failed validation.`);
    process.exit(1);
  }

  console.log(`\nAll ${results.length} feeds validated.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

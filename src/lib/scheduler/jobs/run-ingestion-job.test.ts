import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { resetConfigCache } from "@/config/accessors";
import { ENV_KEYS, resetEnvSnapshot } from "@/config/env";
import { RunIngestionJob } from "@/lib/scheduler/jobs/run-ingestion-job";
import type { RssIngestionPersistenceRunner } from "@/lib/news-ingestion/pipeline/rss-ingestion-persistence-runner";

describe("RunIngestionJob", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEWS_INGESTION_ENABLED: "true",
      NEWS_RSS_FEEDS: JSON.stringify([
        {
          sourceSlug: "demo",
          feedUrl: "https://example.com/feed.xml",
        },
      ]),
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
    };
    resetEnvSnapshot();
    resetConfigCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetEnvSnapshot();
    resetConfigCache();
  });

  it("skips when ingestion is disabled", async () => {
    process.env[ENV_KEYS.NEWS_INGESTION_ENABLED] = "false";
    resetEnvSnapshot();
    resetConfigCache();

    const job = new RunIngestionJob({
      runner: { run: vi.fn() } as unknown as RssIngestionPersistenceRunner,
    });

    const summary = await job.execute({
      runId: "run-1",
      startedAt: new Date().toISOString(),
    });

    expect(summary.status).toBe("skipped");
    expect(summary.skipReason).toContain("NEWS_INGESTION_ENABLED");
  });

  it("aggregates persistence metrics from the runner", async () => {
    const runner = {
      run: vi.fn(async () => ({
        ok: true as const,
        data: {
          normalized: 3,
          persistence: {
            results: [],
            persisted: 3,
            skippedDuplicates: 1,
            failed: 0,
          },
        },
      })),
    } as unknown as RssIngestionPersistenceRunner;

    const job = new RunIngestionJob({ runner });
    const summary = await job.execute({
      runId: "run-2",
      startedAt: new Date().toISOString(),
    });

    expect(summary.status).toBe("success");
    expect(summary.metrics.normalized).toBe(3);
    expect(summary.metrics.persisted).toBe(3);
    expect(summary.metrics.duplicates).toBe(1);
  });
});

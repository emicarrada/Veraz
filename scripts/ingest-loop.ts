#!/usr/bin/env npx tsx
/**
 * Runs RSS ingestion on an interval for local development.
 *
 * Usage:
 *   npm run ingest:watch
 */
import { getSchedulerConfig } from "../src/config/accessors";
import { runSchedulerJob } from "../src/lib/scheduler/run-job";

function formatTimestamp(): string {
  return new Date().toISOString();
}

async function runOnce(): Promise<void> {
  console.log(`[${formatTimestamp()}] Starting run_ingestion...`);
  const summary = await runSchedulerJob("run_ingestion");
  console.log(JSON.stringify(summary, null, 2));
}

async function main(): Promise<void> {
  const { ingestionIntervalSeconds } = getSchedulerConfig();
  const intervalMs = Math.max(60, ingestionIntervalSeconds) * 1_000;

  console.log(
    `[ingest:watch] Running ingestion every ${ingestionIntervalSeconds}s. Press Ctrl+C to stop.`,
  );

  await runOnce();

  const timer = setInterval(() => {
    void runOnce();
  }, intervalMs);

  const shutdown = () => {
    clearInterval(timer);
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

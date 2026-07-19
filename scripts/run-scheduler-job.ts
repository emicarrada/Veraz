#!/usr/bin/env npx tsx
/**
 * Run a scheduler job from the CLI (local dev, GitHub Actions, etc.).
 *
 * Usage:
 *   npx tsx scripts/run-scheduler-job.ts run_ingestion
 *   npx tsx scripts/run-scheduler-job.ts discover_feeds
 *   npx tsx scripts/run-scheduler-job.ts health_check
 */
import { isScheduledJobName, runSchedulerJob } from "../src/lib/scheduler/run-job";

async function main() {
  const jobName = process.argv[2];

  if (!jobName || !isScheduledJobName(jobName)) {
    console.error("Usage: npx tsx scripts/run-scheduler-job.ts <discover_feeds|run_ingestion|health_check>");
    process.exit(1);
  }

  const summary = await runSchedulerJob(jobName);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.status === "failure" ? 1 : 0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

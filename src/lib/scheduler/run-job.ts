import { randomUUID } from "node:crypto";

import { DiscoverFeedsJob } from "@/lib/scheduler/jobs/discover-feeds-job";
import { HealthCheckJob } from "@/lib/scheduler/jobs/health-check-job";
import { RunIngestionJob } from "@/lib/scheduler/jobs/run-ingestion-job";
import { jobLogger } from "@/lib/scheduler/logger/job-logger";
import type {
  JobRunContext,
  JobRunSummary,
  ScheduledJob,
  ScheduledJobName,
} from "@/lib/scheduler/types/job-run";

export function createScheduledJob(name: ScheduledJobName): ScheduledJob {
  switch (name) {
    case "discover_feeds":
      return new DiscoverFeedsJob();
    case "run_ingestion":
      return new RunIngestionJob();
    case "health_check":
      return new HealthCheckJob();
    default: {
      const exhaustive: never = name;
      throw new Error(`Unknown scheduled job: ${exhaustive}`);
    }
  }
}

export function isScheduledJobName(value: string): value is ScheduledJobName {
  return value === "discover_feeds" || value === "run_ingestion" || value === "health_check";
}

export async function runSchedulerJob(name: ScheduledJobName): Promise<JobRunSummary> {
  const context: JobRunContext = {
    runId: randomUUID(),
    startedAt: new Date().toISOString(),
  };

  const job = createScheduledJob(name);
  jobLogger.logStart(context, name);

  const summary = await job.execute(context);
  jobLogger.logComplete(summary);

  return summary;
}

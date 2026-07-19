export type ScheduledJobName = "discover_feeds" | "run_ingestion" | "health_check";

export type JobRunStatus = "success" | "partial" | "failure" | "skipped";

export type JobRunMetrics = {
  feedsConfigured: number;
  feedsProcessed: number;
  discovered: number;
  normalized: number;
  persisted: number;
  duplicates: number;
  failed: number;
};

export type JobRunError = {
  sourceSlug?: string;
  code?: string;
  message: string;
};

export type JobRunContext = {
  runId: string;
  startedAt: string;
};

export type JobRunSummary = {
  jobName: ScheduledJobName;
  runId: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  status: JobRunStatus;
  metrics: JobRunMetrics;
  errors: ReadonlyArray<JobRunError>;
  /** Present when status is skipped (e.g. ingestion disabled). */
  skipReason?: string;
};

export type ScheduledJob = {
  readonly name: ScheduledJobName;
  execute(context: JobRunContext): Promise<JobRunSummary>;
};

export function emptyJobMetrics(): JobRunMetrics {
  return {
    feedsConfigured: 0,
    feedsProcessed: 0,
    discovered: 0,
    normalized: 0,
    persisted: 0,
    duplicates: 0,
    failed: 0,
  };
}

export function finalizeJobRun(
  context: JobRunContext,
  startedAtMs: number,
  partial: Omit<JobRunSummary, "runId" | "startedAt" | "finishedAt" | "durationMs">,
): JobRunSummary {
  const finishedAt = new Date().toISOString();
  return {
    runId: context.runId,
    startedAt: context.startedAt,
    finishedAt,
    durationMs: Date.now() - startedAtMs,
    ...partial,
  };
}

export function resolveJobStatus(
  metrics: JobRunMetrics,
  errors: ReadonlyArray<JobRunError>,
): JobRunStatus {
  if (errors.length === 0) return "success";
  if (metrics.feedsProcessed > 0 && metrics.failed < metrics.feedsProcessed) {
    return "partial";
  }
  return "failure";
}

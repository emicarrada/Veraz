import { getNewsConfig } from "@/config/accessors";
import {
  createRssIngestionPersistenceRunner,
  type RssIngestionPersistenceRunner,
} from "@/lib/news-ingestion/pipeline/rss-ingestion-persistence-runner";
import {
  emptyJobMetrics,
  finalizeJobRun,
  resolveJobStatus,
  type JobRunContext,
  type JobRunError,
  type JobRunSummary,
  type ScheduledJob,
} from "@/lib/scheduler/types/job-run";

export type RunIngestionJobOptions = {
  runner?: RssIngestionPersistenceRunner;
};

/**
 * Runs the full RSS pipeline (discover → fetch → normalize → persist) per feed.
 */
export class RunIngestionJob implements ScheduledJob {
  readonly name = "run_ingestion" as const;
  private readonly runner: RssIngestionPersistenceRunner;

  constructor(options: RunIngestionJobOptions = {}) {
    this.runner = options.runner ?? createRssIngestionPersistenceRunner();
  }

  async execute(context: JobRunContext): Promise<JobRunSummary> {
    const startedAtMs = Date.now();
    const newsConfig = getNewsConfig();
    const feeds = newsConfig.rss.feeds;
    const metrics = emptyJobMetrics();
    metrics.feedsConfigured = feeds.length;
    const errors: JobRunError[] = [];

    if (!newsConfig.ingestionEnabled) {
      return finalizeJobRun(context, startedAtMs, {
        jobName: this.name,
        status: "skipped",
        skipReason: "NEWS_INGESTION_ENABLED is false.",
        metrics,
        errors,
      });
    }

    if (feeds.length === 0) {
      return finalizeJobRun(context, startedAtMs, {
        jobName: this.name,
        status: "skipped",
        skipReason: "No RSS feeds configured.",
        metrics,
        errors,
      });
    }

    for (const feed of feeds) {
      const result = await this.runner.run({
        sourceSlug: feed.sourceSlug,
        feedUrl: feed.feedUrl,
        limit: newsConfig.discoverBatchLimit,
      });

      metrics.feedsProcessed += 1;

      if (!result.ok) {
        metrics.failed += 1;
        errors.push({
          sourceSlug: feed.sourceSlug,
          code: result.error.code,
          message: result.error.message,
        });
        continue;
      }

      metrics.normalized += result.data.normalized;
      metrics.persisted += result.data.persistence.persisted;
      metrics.duplicates += result.data.persistence.skippedDuplicates;
      metrics.failed += result.data.persistence.failed;
      metrics.discovered += result.data.normalized;
    }

    return finalizeJobRun(context, startedAtMs, {
      jobName: this.name,
      status: resolveJobStatus(metrics, errors),
      metrics,
      errors,
    });
  }
}

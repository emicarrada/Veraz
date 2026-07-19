import { getNewsConfig } from "@/config/accessors";
import type { NewsProvider } from "@/lib/news-ingestion/contracts/news-provider";
import { RSSProvider } from "@/lib/news-ingestion/providers/rss";
import {
  emptyJobMetrics,
  finalizeJobRun,
  resolveJobStatus,
  type JobRunContext,
  type JobRunError,
  type JobRunSummary,
  type ScheduledJob,
} from "@/lib/scheduler/types/job-run";

export type DiscoverFeedsJobOptions = {
  provider?: NewsProvider;
};

/**
 * Discovers RSS candidates for all configured feeds (no persistence).
 */
export class DiscoverFeedsJob implements ScheduledJob {
  readonly name = "discover_feeds" as const;
  private readonly provider: NewsProvider;

  constructor(options: DiscoverFeedsJobOptions = {}) {
    this.provider = options.provider ?? new RSSProvider();
  }

  async execute(context: JobRunContext): Promise<JobRunSummary> {
    const startedAtMs = Date.now();
    const newsConfig = getNewsConfig();
    const feeds = newsConfig.rss.feeds;
    const metrics = emptyJobMetrics();
    metrics.feedsConfigured = feeds.length;
    const errors: JobRunError[] = [];

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
      const result = await this.provider.discover({
        providerId: "rss",
        sourceSlug: feed.sourceSlug,
        endpoint: feed.feedUrl,
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

      metrics.discovered += result.data.candidates.length;
    }

    return finalizeJobRun(context, startedAtMs, {
      jobName: this.name,
      status: resolveJobStatus(metrics, errors),
      metrics,
      errors,
    });
  }
}

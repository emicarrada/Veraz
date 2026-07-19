import { getNewsConfig } from "@/config/accessors";
import { isContentPersistenceEnabled } from "@/lib/repositories/factory";
import type { NewsProvider } from "@/lib/news-ingestion/contracts/news-provider";
import { RSSProvider } from "@/lib/news-ingestion/providers/rss";
import {
  emptyJobMetrics,
  finalizeJobRun,
  type JobRunContext,
  type JobRunError,
  type JobRunSummary,
  type ScheduledJob,
} from "@/lib/scheduler/types/job-run";

export type HealthCheckJobOptions = {
  provider?: NewsProvider;
};

/**
 * Checks RSS provider readiness and feed reachability.
 */
export class HealthCheckJob implements ScheduledJob {
  readonly name = "health_check" as const;
  private readonly provider: NewsProvider;

  constructor(options: HealthCheckJobOptions = {}) {
    this.provider = options.provider ?? new RSSProvider();
  }

  async execute(context: JobRunContext): Promise<JobRunSummary> {
    const startedAtMs = Date.now();
    const newsConfig = getNewsConfig();
    const feeds = newsConfig.rss.feeds;
    const metrics = emptyJobMetrics();
    metrics.feedsConfigured = feeds.length;
    const errors: JobRunError[] = [];

    if (this.provider.healthCheck) {
      const providerHealth = await this.provider.healthCheck();
      if (providerHealth.status !== "healthy") {
        errors.push({
          code: "provider_unhealthy",
          message: providerHealth.detail ?? "RSS provider unhealthy.",
        });
      }
    }

    if (!isContentPersistenceEnabled()) {
      errors.push({
        code: "persistence_not_configured",
        message: "Supabase persistence is not configured.",
      });
    }

    for (const feed of feeds) {
      const checkStarted = Date.now();
      const result = await this.provider.discover({
        providerId: "rss",
        sourceSlug: feed.sourceSlug,
        endpoint: feed.feedUrl,
        limit: 1,
      });
      const latencyMs = Date.now() - checkStarted;

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

    const status =
      errors.length === 0
        ? "success"
        : metrics.feedsProcessed > 0 && metrics.failed < metrics.feedsProcessed
          ? "partial"
          : feeds.length === 0 && errors.length > 0
            ? "partial"
            : metrics.failed === metrics.feedsProcessed && metrics.feedsProcessed > 0
              ? "failure"
              : errors.length > 0
                ? "partial"
                : "success";

    return finalizeJobRun(context, startedAtMs, {
      jobName: this.name,
      status,
      metrics,
      errors,
    });
  }
}

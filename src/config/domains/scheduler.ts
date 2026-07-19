/**
 * Scheduler intervals — declarative only (no job execution here).
 * Align external cron (e.g. vercel.json) with these values.
 */
export type SchedulerConfig = {
  /** Recommended interval for RunIngestionJob (seconds). */
  ingestionIntervalSeconds: number;
  /** Recommended interval for DiscoverFeedsJob (seconds). */
  discoverIntervalSeconds: number;
  /** Recommended interval for HealthCheckJob (seconds). */
  healthCheckIntervalSeconds: number;
};

export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  ingestionIntervalSeconds: 900,
  discoverIntervalSeconds: 900,
  healthCheckIntervalSeconds: 300,
};

/** Human-readable hints for operators — not parsed at runtime. */
export const SCHEDULER_CRON_HINTS = {
  ingestion: "every 15 minutes (when ingestionIntervalSeconds=900)",
  discover: "every 15 minutes (when discoverIntervalSeconds=900)",
  healthCheck: "every 5 minutes (when healthCheckIntervalSeconds=300)",
} as const;

/**
 * Canonical environment variable keys.
 * Only `env/reader.ts` may read `process.env` — all keys are declared here.
 */
export const ENV_KEYS = {
  /** Veraz profile: development | staging | production */
  VERAZ_ENV: "VERAZ_ENV",
  NODE_ENV: "NODE_ENV",

  /** App */
  NEXT_PUBLIC_SITE_URL: "NEXT_PUBLIC_SITE_URL",
  NEXT_PUBLIC_APP_NAME: "NEXT_PUBLIC_APP_NAME",

  /** Supabase (future) */
  NEXT_PUBLIC_SUPABASE_URL: "NEXT_PUBLIC_SUPABASE_URL",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  SUPABASE_SERVICE_ROLE_KEY: "SUPABASE_SERVICE_ROLE_KEY",

  /** AI Engine */
  AI_MODE: "AI_MODE",
  AI_PROVIDER: "AI_PROVIDER",
  AI_FAIL_OPEN: "AI_FAIL_OPEN",

  /** News Ingestion */
  NEWS_INGESTION_ENABLED: "NEWS_INGESTION_ENABLED",
  /** JSON array: [{ "sourceSlug", "feedUrl", "defaultLanguageCode?" }] */
  NEWS_RSS_FEEDS: "NEWS_RSS_FEEDS",
  /** Scheduler: RunIngestionJob interval (seconds). */
  NEWS_INGESTION_INTERVAL_SECONDS: "NEWS_INGESTION_INTERVAL_SECONDS",
  /** Scheduler: DiscoverFeedsJob interval (seconds). */
  NEWS_DISCOVER_INTERVAL_SECONDS: "NEWS_DISCOVER_INTERVAL_SECONDS",
  /** Scheduler: HealthCheckJob interval (seconds). */
  NEWS_HEALTH_CHECK_INTERVAL_SECONDS: "NEWS_HEALTH_CHECK_INTERVAL_SECONDS",

  /** Feature flags */
  FF_AI: "FF_AI",
  FF_PREMIUM: "FF_PREMIUM",
  FF_NEWS_COMPARISON: "FF_NEWS_COMPARISON",
  FF_TIMELINE: "FF_TIMELINE",
  FF_ADVANCED_SEARCH: "FF_ADVANCED_SEARCH",
  FF_NOTIFICATIONS: "FF_NOTIFICATIONS",
  FF_MAINTENANCE_MODE: "FF_MAINTENANCE_MODE",

  /** Cache (future) */
  CACHE_DEFAULT_TTL_SECONDS: "CACHE_DEFAULT_TTL_SECONDS",

  /** Analytics (PostHog) */
  ANALYTICS_ENABLED: "ANALYTICS_ENABLED",
  NEXT_PUBLIC_POSTHOG_KEY: "NEXT_PUBLIC_POSTHOG_KEY",
  NEXT_PUBLIC_POSTHOG_HOST: "NEXT_PUBLIC_POSTHOG_HOST",

  /** Security (cron / internal jobs) */
  CRON_SECRET: "CRON_SECRET",
} as const;

export type EnvKey = (typeof ENV_KEYS)[keyof typeof ENV_KEYS];

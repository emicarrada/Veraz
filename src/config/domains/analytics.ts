/**
 * Analytics / telemetry configuration (declarative only).
 */
export type AnalyticsProvider = "none" | "vercel" | "plausible" | "posthog" | "custom";

export type AnalyticsConfig = {
  enabled: boolean;
  provider: AnalyticsProvider;
  /** PostHog project API key (public, client-side). */
  publicId?: string;
  /** PostHog ingestion host, e.g. https://us.i.posthog.com */
  posthogHost?: string;
};

export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  enabled: false,
  provider: "none",
};

export const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

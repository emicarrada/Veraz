/**
 * Analytics / telemetry configuration (declarative only).
 */
export type AnalyticsConfig = {
  enabled: boolean;
  provider: "none" | "vercel" | "plausible" | "custom";
  /** Public analytics id when applicable (future). */
  publicId?: string;
};

export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  enabled: false,
  provider: "none",
};

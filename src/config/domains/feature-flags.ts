/**
 * Product feature toggles — resolved from env with safe defaults.
 */
export type FeatureFlags = {
  /** AI enrichment (AI Engine). Default off. */
  ai: boolean;
  /** Premium plans and paywall surfaces. */
  premium: boolean;
  /** Multi-source story comparison UI. */
  newsComparison: boolean;
  /** Story timeline surfaces. */
  timeline: boolean;
  /** Advanced search filters / FTS UI. */
  advancedSearch: boolean;
  /** In-app notifications. */
  notifications: boolean;
  /** Maintenance mode — read-only / landing only. */
  maintenanceMode: boolean;
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  ai: false,
  premium: false,
  newsComparison: false,
  timeline: true,
  advancedSearch: false,
  notifications: false,
  maintenanceMode: false,
};

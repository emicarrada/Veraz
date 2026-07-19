/**
 * Config Engine — centralized configuration for Veraz.
 *
 * - All env access goes through `config/env/` (single snapshot of process.env).
 * - Features, lib, and app import `@/config` — never `process.env` directly.
 * - No business logic; mapping and defaults only.
 */

export type { AppEnvironment } from "@/config/types/environment";
export { APP_ENVIRONMENTS } from "@/config/types/environment";

export type { VerazConfig } from "@/config/types/veraz-config";

export type {
  AppConfig,
  AIConfig,
  NewsConfig,
  RssFeedConfig,
  ProviderConfig,
  ProviderSlotConfig,
  AIProviderSlotConfig,
  NewsProviderSlotConfig,
  CacheConfig,
  SearchConfig,
  PremiumConfig,
  SecurityConfig,
  AnalyticsConfig,
  FeatureFlags,
} from "@/config/domains";

export {
  DEFAULT_APP_NAME,
  DEFAULT_APP_TAGLINE,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_NEWS_CONFIG,
  DEFAULT_PROVIDER_CONFIG,
  DEFAULT_CACHE_CONFIG,
  DEFAULT_SEARCH_CONFIG,
  DEFAULT_PREMIUM_CONFIG,
  DEFAULT_SECURITY_CONFIG,
  DEFAULT_ANALYTICS_CONFIG,
  AI_PROVIDER_CREDENTIAL_ENV_KEYS,
} from "@/config/domains";

export { ENV_KEYS, type EnvKey } from "@/config/env/keys";

export {
  getConfig,
  getAppConfig,
  getAIConfig,
  getNewsConfig,
  getRssFeedBySourceSlug,
  getProviderConfig,
  getCacheConfig,
  getSearchConfig,
  getPremiumConfig,
  getSecurityConfig,
  getAnalyticsConfig,
  getFeatureFlags,
  resetConfigCache,
  isAIEnabled,
  isFeatureEnabled,
} from "@/config/accessors";

export { buildConfig } from "@/config/build-config";

export type {
  ConfigValidationIssue,
  ConfigValidationResult,
  ConfigValidator,
} from "@/config/validation";

export { validateConfig, CONFIG_VALIDATORS } from "@/config/validation";

/** @deprecated Use getAIConfig().engine — kept for AI Engine bridge. */
export type { AIEngineConfig } from "@/lib/ai-engine/config/types";

export { DEFAULT_AI_ENGINE_CONFIG } from "@/lib/ai-engine/config/types";

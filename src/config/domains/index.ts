export type { AppConfig } from "@/config/domains/app";
export {
  CANONICAL_SITE_URL,
  DEFAULT_APP_NAME,
  DEFAULT_APP_TAGLINE,
  DEFAULT_SITE_URLS,
} from "@/config/domains/app";

export type { AIConfig, AIProviderCredentialMap } from "@/config/domains/ai";
export { AI_PROVIDER_CREDENTIAL_ENV_KEYS } from "@/config/domains/ai";

export type { NewsConfig, RssFeedConfig } from "@/config/domains/news";
export { DEFAULT_NEWS_CONFIG } from "@/config/domains/news";

export type {
  ProviderConfig,
  ProviderSlotConfig,
  AIProviderSlotConfig,
  NewsProviderSlotConfig,
  AIProvidersConfig,
  NewsProvidersConfig,
} from "@/config/domains/providers";
export {
  DEFAULT_PROVIDER_CONFIG,
  DEFAULT_AI_PROVIDER_SLOTS,
  DEFAULT_NEWS_PROVIDER_SLOTS,
} from "@/config/domains/providers";

export type { CacheConfig } from "@/config/domains/cache";
export { DEFAULT_CACHE_CONFIG } from "@/config/domains/cache";

export type { SearchConfig } from "@/config/domains/search";
export { DEFAULT_SEARCH_CONFIG } from "@/config/domains/search";

export type { PremiumConfig } from "@/config/domains/premium";
export { DEFAULT_PREMIUM_CONFIG } from "@/config/domains/premium";

export type { SecurityConfig } from "@/config/domains/security";
export { DEFAULT_SECURITY_CONFIG } from "@/config/domains/security";

export type { AnalyticsConfig } from "@/config/domains/analytics";
export { DEFAULT_ANALYTICS_CONFIG } from "@/config/domains/analytics";

export type { FeatureFlags } from "@/config/domains/feature-flags";
export { DEFAULT_FEATURE_FLAGS } from "@/config/domains/feature-flags";

export type { SupabaseConfig } from "@/config/domains/supabase";
export { DEFAULT_SUPABASE_CONFIG } from "@/config/domains/supabase";

export type { SchedulerConfig } from "@/config/domains/scheduler";
export {
  DEFAULT_SCHEDULER_CONFIG,
  SCHEDULER_CRON_HINTS,
} from "@/config/domains/scheduler";

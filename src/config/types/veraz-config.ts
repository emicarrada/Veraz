import type { AIConfig } from "@/config/domains/ai";
import type { AnalyticsConfig } from "@/config/domains/analytics";
import type { AppConfig } from "@/config/domains/app";
import type { CacheConfig } from "@/config/domains/cache";
import type { FeatureFlags } from "@/config/domains/feature-flags";
import type { NewsConfig } from "@/config/domains/news";
import type { PremiumConfig } from "@/config/domains/premium";
import type { ProviderConfig } from "@/config/domains/providers";
import type { SearchConfig } from "@/config/domains/search";
import type { SecurityConfig } from "@/config/domains/security";
import type { SchedulerConfig } from "@/config/domains/scheduler";
import type { SupabaseConfig } from "@/config/domains/supabase";
import type { AppEnvironment } from "@/config/types/environment";

/**
 * Root configuration snapshot for the entire application.
 */
export type VerazConfig = {
  environment: AppEnvironment;
  app: AppConfig;
  ai: AIConfig;
  news: NewsConfig;
  providers: ProviderConfig;
  cache: CacheConfig;
  search: SearchConfig;
  premium: PremiumConfig;
  security: SecurityConfig;
  supabase: SupabaseConfig;
  scheduler: SchedulerConfig;
  analytics: AnalyticsConfig;
  featureFlags: FeatureFlags;
};

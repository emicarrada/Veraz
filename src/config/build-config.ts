import {
  AI_PROVIDER_CREDENTIAL_ENV_KEYS,
  DEFAULT_ANALYTICS_CONFIG,
  DEFAULT_CACHE_CONFIG,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_NEWS_CONFIG,
  DEFAULT_PREMIUM_CONFIG,
  DEFAULT_PROVIDER_CONFIG,
  DEFAULT_SEARCH_CONFIG,
  DEFAULT_SECURITY_CONFIG,
  DEFAULT_SUPABASE_CONFIG,
  DEFAULT_SCHEDULER_CONFIG,
  DEFAULT_APP_NAME,
  DEFAULT_APP_TAGLINE,
} from "@/config/domains";
import type { AIConfig } from "@/config/domains/ai";
import type { AnalyticsConfig } from "@/config/domains/analytics";
import { DEFAULT_POSTHOG_HOST } from "@/config/domains/analytics";
import type { AppConfig } from "@/config/domains/app";
import type { CacheConfig } from "@/config/domains/cache";
import type { FeatureFlags } from "@/config/domains/feature-flags";
import type { NewsConfig, RssFeedConfig } from "@/config/domains/news";
import { isNewsTopicGroup } from "@/features/news/classification/categories";
import type { PremiumConfig } from "@/config/domains/premium";
import type { ProviderConfig } from "@/config/domains/providers";
import type { SearchConfig } from "@/config/domains/search";
import type { SecurityConfig } from "@/config/domains/security";
import type { SchedulerConfig } from "@/config/domains/scheduler";
import type { SupabaseConfig } from "@/config/domains/supabase";
import { ENV_KEYS, getEnv, getEnvBoolean, getEnvInt, hasEnv } from "@/config/env";
import {
  getDefaultSiteUrl,
  resolveAppEnvironment,
  resolveSiteUrl,
} from "@/config/resolve-environment";
import type { VerazConfig } from "@/config/types/veraz-config";
import type { AppEnvironment } from "@/config/types/environment";
import { DEFAULT_AI_ENGINE_CONFIG } from "@/lib/ai-engine/config/types";
import type { AIMode, AIProviderId } from "@/lib/ai-engine/types/capabilities";

const AI_MODES = ["disabled", "summaries", "context", "full"] as const satisfies ReadonlyArray<AIMode>;

function parseAIMode(raw: string | undefined): AIMode {
  if (raw && (AI_MODES as ReadonlyArray<string>).includes(raw)) {
    return raw as AIMode;
  }
  return DEFAULT_AI_ENGINE_CONFIG.mode;
}

function parseAIProvider(raw: string | undefined): AIProviderId {
  return raw?.trim() ? (raw.trim() as AIProviderId) : DEFAULT_AI_ENGINE_CONFIG.provider;
}

function buildAppConfig(): AppConfig {
  const environment = resolveAppEnvironment();
  return {
    name: getEnv(ENV_KEYS.NEXT_PUBLIC_APP_NAME) ?? DEFAULT_APP_NAME,
    tagline: DEFAULT_APP_TAGLINE,
    environment,
    siteUrl: resolveSiteUrl(environment),
    isProduction: environment === "production",
    isDevelopment: environment === "development",
    isStaging: environment === "staging",
  };
}

function buildAIConfig(): AIConfig {
  const provider = parseAIProvider(getEnv(ENV_KEYS.AI_PROVIDER));
  const mode = parseAIMode(getEnv(ENV_KEYS.AI_MODE));
  const failOpen = getEnvBoolean(ENV_KEYS.AI_FAIL_OPEN, DEFAULT_AI_ENGINE_CONFIG.failOpen);

  const credentialEnvKey = AI_PROVIDER_CREDENTIAL_ENV_KEYS[provider];

  return {
    engine: {
      mode,
      provider,
      failOpen,
    },
    ...(credentialEnvKey ? { credentialEnvKey } : {}),
  };
}

function parseRssFeeds(raw: string | undefined): ReadonlyArray<RssFeedConfig> {
  if (!raw?.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry) => {
      if (
        typeof entry !== "object" ||
        entry === null ||
        typeof (entry as RssFeedConfig).sourceSlug !== "string" ||
        typeof (entry as RssFeedConfig).feedUrl !== "string"
      ) {
        return [];
      }

      const feed = entry as RssFeedConfig;
      return [
        {
          sourceSlug: feed.sourceSlug.trim(),
          feedUrl: feed.feedUrl.trim(),
          ...(feed.defaultLanguageCode
            ? { defaultLanguageCode: feed.defaultLanguageCode.trim() }
            : {}),
          ...(feed.defaultTopicGroup && isNewsTopicGroup(feed.defaultTopicGroup)
            ? { defaultTopicGroup: feed.defaultTopicGroup }
            : {}),
          ...(feed.primaryVertical === "finance" ||
          feed.primaryVertical === "tech" ||
          feed.primaryVertical === "sports" ||
          feed.primaryVertical === "culture" ||
          feed.primaryVertical === "general"
            ? { primaryVertical: feed.primaryVertical }
            : {}),
        },
      ];
    });
  } catch {
    return [];
  }
}

function buildNewsConfig(): NewsConfig {
  return {
    ...DEFAULT_NEWS_CONFIG,
    ingestionEnabled: getEnvBoolean(
      ENV_KEYS.NEWS_INGESTION_ENABLED,
      DEFAULT_NEWS_CONFIG.ingestionEnabled,
    ),
    rss: {
      feeds: parseRssFeeds(getEnv(ENV_KEYS.NEWS_RSS_FEEDS)),
    },
  };
}

function buildProviderConfig(): ProviderConfig {
  const ai = buildAIConfig();

  return {
    ai: {
      activeProviderId: ai.engine.provider,
      slots: DEFAULT_PROVIDER_CONFIG.ai.slots.map((slot) => ({
        ...slot,
        enabled: slot.id === ai.engine.provider && ai.engine.provider !== "none",
      })),
    },
    news: {
      ...DEFAULT_PROVIDER_CONFIG.news,
      enabledProviderIds: DEFAULT_PROVIDER_CONFIG.news.enabledProviderIds,
    },
  };
}

function buildCacheConfig(): CacheConfig {
  const ttl = getEnvInt(ENV_KEYS.CACHE_DEFAULT_TTL_SECONDS, DEFAULT_CACHE_CONFIG.defaultTtlSeconds);
  return {
    ...DEFAULT_CACHE_CONFIG,
    defaultTtlSeconds: ttl,
    feedRevalidateSeconds: ttl * 2,
    articleRevalidateSeconds: ttl * 5,
  };
}

function buildSearchConfig(featureFlags: FeatureFlags): SearchConfig {
  return {
    ...DEFAULT_SEARCH_CONFIG,
    enabled: featureFlags.advancedSearch,
    backend: featureFlags.advancedSearch ? "postgres_fts" : "disabled",
  };
}

function buildPremiumConfig(featureFlags: FeatureFlags): PremiumConfig {
  return {
    ...DEFAULT_PREMIUM_CONFIG,
    enabled: featureFlags.premium,
  };
}

function buildSecurityConfig(environment: AppEnvironment): SecurityConfig {
  return {
    ...DEFAULT_SECURITY_CONFIG,
    cronAuthRequired: environment !== "development",
    hasServiceRoleKey: hasEnv(ENV_KEYS.SUPABASE_SERVICE_ROLE_KEY),
  };
}

function buildSchedulerConfig(): SchedulerConfig {
  return {
    ...DEFAULT_SCHEDULER_CONFIG,
    ingestionIntervalSeconds: getEnvInt(
      ENV_KEYS.NEWS_INGESTION_INTERVAL_SECONDS,
      DEFAULT_SCHEDULER_CONFIG.ingestionIntervalSeconds,
    ),
    discoverIntervalSeconds: getEnvInt(
      ENV_KEYS.NEWS_DISCOVER_INTERVAL_SECONDS,
      DEFAULT_SCHEDULER_CONFIG.discoverIntervalSeconds,
    ),
    healthCheckIntervalSeconds: getEnvInt(
      ENV_KEYS.NEWS_HEALTH_CHECK_INTERVAL_SECONDS,
      DEFAULT_SCHEDULER_CONFIG.healthCheckIntervalSeconds,
    ),
  };
}

function buildSupabaseConfig(): SupabaseConfig {
  const url = getEnv(ENV_KEYS.NEXT_PUBLIC_SUPABASE_URL) ?? "";
  const anonKey = getEnv(ENV_KEYS.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? "";
  const hasServiceRoleKey = hasEnv(ENV_KEYS.SUPABASE_SERVICE_ROLE_KEY);

  return {
    ...DEFAULT_SUPABASE_CONFIG,
    url,
    anonKey,
    hasServiceRoleKey,
    persistenceEnabled: Boolean(url.trim() && hasServiceRoleKey),
  };
}

function buildAnalyticsConfig(environment: AppEnvironment): AnalyticsConfig {
  const apiKey = getEnv(ENV_KEYS.NEXT_PUBLIC_POSTHOG_KEY)?.trim();
  const apiHost =
    getEnv(ENV_KEYS.NEXT_PUBLIC_POSTHOG_HOST)?.trim() || DEFAULT_POSTHOG_HOST;
  const explicitlyEnabled = getEnvBoolean(ENV_KEYS.ANALYTICS_ENABLED, false);
  const enabled =
    Boolean(apiKey) &&
    (environment === "production" || environment === "staging" || explicitlyEnabled);

  if (!enabled || !apiKey) {
    return { ...DEFAULT_ANALYTICS_CONFIG };
  }

  return {
    enabled: true,
    provider: "posthog",
    publicId: apiKey,
    posthogHost: apiHost,
  };
}

function buildFeatureFlags(): FeatureFlags {
  return {
    ai: getEnvBoolean(ENV_KEYS.FF_AI, DEFAULT_FEATURE_FLAGS.ai),
    premium: getEnvBoolean(ENV_KEYS.FF_PREMIUM, DEFAULT_FEATURE_FLAGS.premium),
    newsComparison: getEnvBoolean(
      ENV_KEYS.FF_NEWS_COMPARISON,
      DEFAULT_FEATURE_FLAGS.newsComparison,
    ),
    timeline: getEnvBoolean(ENV_KEYS.FF_TIMELINE, DEFAULT_FEATURE_FLAGS.timeline),
    advancedSearch: getEnvBoolean(
      ENV_KEYS.FF_ADVANCED_SEARCH,
      DEFAULT_FEATURE_FLAGS.advancedSearch,
    ),
    notifications: getEnvBoolean(
      ENV_KEYS.FF_NOTIFICATIONS,
      DEFAULT_FEATURE_FLAGS.notifications,
    ),
    maintenanceMode: getEnvBoolean(
      ENV_KEYS.FF_MAINTENANCE_MODE,
      DEFAULT_FEATURE_FLAGS.maintenanceMode,
    ),
  };
}

/**
 * Assembles the full configuration snapshot from env + defaults.
 * Mapping only — no business rules.
 */
export function buildConfig(): VerazConfig {
  const environment = resolveAppEnvironment();
  const featureFlags = buildFeatureFlags();

  return {
    environment,
    app: buildAppConfig(),
    ai: buildAIConfig(),
    news: buildNewsConfig(),
    providers: buildProviderConfig(),
    cache: buildCacheConfig(),
    search: buildSearchConfig(featureFlags),
    premium: buildPremiumConfig(featureFlags),
    security: buildSecurityConfig(environment),
    supabase: buildSupabaseConfig(),
    scheduler: buildSchedulerConfig(),
    analytics: buildAnalyticsConfig(environment),
    featureFlags,
  };
}

export { getDefaultSiteUrl };

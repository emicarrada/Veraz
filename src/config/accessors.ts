import { buildConfig } from "@/config/build-config";
import type { VerazConfig } from "@/config/types/veraz-config";

let cachedConfig: VerazConfig | null = null;

/**
 * Returns the application configuration snapshot (lazy, cached per runtime).
 */
export function getConfig(): VerazConfig {
  if (!cachedConfig) {
    cachedConfig = buildConfig();
  }
  return cachedConfig;
}

/** Domain accessors — prefer these over reading VerazConfig ad hoc. */
export function getAppConfig() {
  return getConfig().app;
}

export function getAIConfig() {
  return getConfig().ai;
}

export function getNewsConfig() {
  return getConfig().news;
}

export function getRssFeedBySourceSlug(sourceSlug: string) {
  return getNewsConfig().rss.feeds.find((feed) => feed.sourceSlug === sourceSlug);
}

export function getProviderConfig() {
  return getConfig().providers;
}

export function getCacheConfig() {
  return getConfig().cache;
}

export function getSearchConfig() {
  return getConfig().search;
}

export function getPremiumConfig() {
  return getConfig().premium;
}

export function getSecurityConfig() {
  return getConfig().security;
}

export function getAnalyticsConfig() {
  return getConfig().analytics;
}

export function getFeatureFlags() {
  return getConfig().featureFlags;
}

/** Clears cached config (tests / hot reload helpers). */
export function resetConfigCache(): void {
  cachedConfig = null;
}

export function isAIEnabled(): boolean {
  const { engine } = getAIConfig();
  return engine.mode !== "disabled" && engine.provider !== "none";
}

export function getSchedulerConfig() {
  return getConfig().scheduler;
}

export function getSupabaseConfig() {
  return getConfig().supabase;
}

export function isFeatureEnabled(
  flag: keyof import("@/config/domains/feature-flags").FeatureFlags,
): boolean {
  return getFeatureFlags()[flag];
}

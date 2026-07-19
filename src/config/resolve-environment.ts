import { CANONICAL_SITE_URL, DEFAULT_SITE_URLS } from "@/config/domains/app";
import type { AppEnvironment } from "@/config/types/environment";
import { ENV_KEYS, getEnv, getEnvString } from "@/config/env";

/**
 * Resolves Veraz deployment profile from env (single read path).
 */
export function resolveAppEnvironment(): AppEnvironment {
  const verazEnv = getEnv(ENV_KEYS.VERAZ_ENV)?.trim().toLowerCase();

  if (verazEnv === "production" || verazEnv === "prod") return "production";
  if (verazEnv === "staging" || verazEnv === "stage") return "staging";
  if (verazEnv === "development" || verazEnv === "dev") return "development";

  const nodeEnv = getEnv(ENV_KEYS.NODE_ENV)?.trim().toLowerCase();
  if (nodeEnv === "production") return "production";
  if (nodeEnv === "test") return "development";

  return "development";
}

export function getDefaultSiteUrl(environment: AppEnvironment): string {
  return DEFAULT_SITE_URLS[environment];
}

export function resolveSiteUrl(environment: AppEnvironment): string {
  return getEnvString(
    ENV_KEYS.NEXT_PUBLIC_SITE_URL,
    getDefaultSiteUrl(environment),
  );
}

/**
 * Public URL for legal copy and user-facing references — never localhost.
 */
export function getCanonicalSiteUrl(): string {
  const configured = getEnv(ENV_KEYS.NEXT_PUBLIC_SITE_URL)?.trim();

  if (configured && !/localhost|127\.0\.0\.1/i.test(configured)) {
    return configured.replace(/\/$/, "");
  }

  return CANONICAL_SITE_URL;
}

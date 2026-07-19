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
  switch (environment) {
    case "production":
      return "https://veraz.example";
    case "staging":
      return "https://staging.veraz.example";
    default:
      return "http://localhost:3000";
  }
}

export function resolveSiteUrl(environment: AppEnvironment): string {
  return getEnvString(
    ENV_KEYS.NEXT_PUBLIC_SITE_URL,
    getDefaultSiteUrl(environment),
  );
}

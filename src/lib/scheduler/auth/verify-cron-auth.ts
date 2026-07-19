import { getSecurityConfig } from "@/config/accessors";
import { ENV_KEYS, getEnv } from "@/config/env";
import { safeCompare } from "@/lib/security/safe-compare";

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

/**
 * Validates cron/internal job requests.
 * Skips auth in development when cronAuthRequired=false.
 */
export function verifyCronAuth(request: Request): boolean {
  const security = getSecurityConfig();

  if (!security.cronAuthRequired) {
    return true;
  }

  const secret = getEnv(ENV_KEYS.CRON_SECRET);
  if (!secret) {
    return false;
  }

  const bearer = extractBearerToken(request);
  if (bearer && safeCompare(bearer, secret)) {
    return true;
  }

  const headerSecret = request.headers.get("x-cron-secret");
  if (headerSecret && safeCompare(headerSecret, secret)) {
    return true;
  }

  return false;
}

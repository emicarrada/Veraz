import { ENV_KEYS, type EnvKey } from "@/config/env/keys";

/**
 * Raw snapshot of process.env — loaded once per runtime.
 * No other module may access process.env directly.
 */
let envSnapshot: Readonly<Record<string, string | undefined>> | null = null;

function loadEnvSnapshot(): Readonly<Record<string, string | undefined>> {
  if (envSnapshot === null) {
    envSnapshot = Object.freeze({ ...process.env });
  }
  return envSnapshot;
}

/**
 * Static reads so Next can treat these as public values and send them to the
 * browser. A dynamic `process.env` lookup gets blanked when the value crosses
 * into a client component, which hid the Google button.
 */
function readPublicEnv(key: string): string | undefined {
  switch (key) {
    case ENV_KEYS.NEXT_PUBLIC_SUPABASE_URL:
      return process.env.NEXT_PUBLIC_SUPABASE_URL;
    case ENV_KEYS.NEXT_PUBLIC_SUPABASE_ANON_KEY:
      return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    case ENV_KEYS.NEXT_PUBLIC_SITE_URL:
      return process.env.NEXT_PUBLIC_SITE_URL;
    case ENV_KEYS.NEXT_PUBLIC_APP_NAME:
      return process.env.NEXT_PUBLIC_APP_NAME;
    default:
      return undefined;
  }
}

/** Read a single env var. Public keys prefer the static binding above. */
export function getEnv(key: EnvKey | string): string | undefined {
  const direct = readPublicEnv(key)?.trim();
  if (direct) return direct;
  const value = loadEnvSnapshot()[key]?.trim();
  return value ? value : undefined;
}

/** Read env var with string fallback. */
export function getEnvString(
  key: EnvKey | string,
  defaultValue: string,
): string {
  return getEnv(key) ?? defaultValue;
}

/** Parse boolean env (`true` | `1` | `yes`, case-insensitive). */
export function getEnvBoolean(
  key: EnvKey | string,
  defaultValue: boolean,
): boolean {
  const raw = getEnv(key);
  if (raw === undefined) return defaultValue;
  const normalized = raw.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  return defaultValue;
}

/** Parse optional positive integer. */
export function getEnvInt(
  key: EnvKey | string,
  defaultValue: number,
): number {
  const raw = getEnv(key);
  if (raw === undefined) return defaultValue;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

/** Whether a key is set to a non-empty value. */
export function hasEnv(key: EnvKey | string): boolean {
  return getEnv(key) !== undefined;
}

/** Expose keys for documentation — not values. */
export { ENV_KEYS };

/**
 * Test-only reset. Clears cached snapshot so env can be re-read.
 * Not used in production paths.
 */
export function resetEnvSnapshot(): void {
  envSnapshot = null;
}

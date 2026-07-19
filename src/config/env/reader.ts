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

/** Read a single env var from the one-time snapshot. */
export function getEnv(key: EnvKey | string): string | undefined {
  const value = loadEnvSnapshot()[key];
  return value === "" ? undefined : value;
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

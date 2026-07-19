/**
 * Security boundaries — cron secrets, RLS hints (no secret values in config object).
 */
export type SecurityConfig = {
  /** Whether cron route auth is required (future). */
  cronAuthRequired: boolean;
  /** Env key name for cron secret — not the secret itself. */
  cronSecretEnvKey: string;
  /** Whether Supabase service role is configured (future). */
  hasServiceRoleKey: boolean;
};

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  cronAuthRequired: true,
  cronSecretEnvKey: "CRON_SECRET",
  hasServiceRoleKey: false,
};

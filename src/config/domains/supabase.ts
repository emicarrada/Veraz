/**
 * Supabase connectivity — declarative flags only (no client creation here).
 */
export type SupabaseConfig = {
  url: string;
  anonKey: string;
  /** Whether service role key is present (server-side persistence). */
  hasServiceRoleKey: boolean;
  /** True when URL + service role are configured for write operations. */
  persistenceEnabled: boolean;
};

export const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  url: "",
  anonKey: "",
  hasServiceRoleKey: false,
  persistenceEnabled: false,
};

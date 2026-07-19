import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { ENV_KEYS, getEnv } from "@/config/env";
import { SupabaseNotConfiguredError } from "@/lib/supabase/errors";
import type { Database } from "@/lib/supabase/database.types";

let adminClient: SupabaseClient<Database> | null = null;

export function isSupabasePersistenceConfigured(): boolean {
  const url = getEnv(ENV_KEYS.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = getEnv(ENV_KEYS.SUPABASE_SERVICE_ROLE_KEY);
  return Boolean(url?.trim() && serviceRoleKey?.trim());
}

/**
 * Server-side Supabase client (service role). Used by repositories only.
 */
export function createSupabaseAdminClient(): SupabaseClient<Database> {
  const url = getEnv(ENV_KEYS.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = getEnv(ENV_KEYS.SUPABASE_SERVICE_ROLE_KEY);

  if (!url?.trim() || !serviceRoleKey?.trim()) {
    throw new SupabaseNotConfiguredError(
      "Supabase persistence requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  if (!adminClient) {
    adminClient = createClient<Database>(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClient;
}

/** Resets the cached client — for tests only. */
export function resetSupabaseAdminClientForTests(): void {
  adminClient = null;
}

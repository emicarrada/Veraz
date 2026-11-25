import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseConfig } from "@/config/accessors";
import type { Database } from "@/lib/supabase/database.types";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Session client for the signed-in reader. Uses the anon key and the request cookies.
 * Returns null when Supabase public config is missing, so the public feed still renders.
 */
export async function createAuthServerClient() {
  const { url, anonKey } = getSupabaseConfig();
  if (!url.trim() || !anonKey.trim()) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. The middleware refreshes the session.
        }
      },
    },
  });
}

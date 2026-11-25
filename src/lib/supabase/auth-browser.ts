import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database.types";

/** Browser client for the Google button. The anon key is public; the service role never reaches here. */
export function createAuthBrowserClient(url: string, anonKey: string) {
  return createBrowserClient<Database>(url, anonKey);
}

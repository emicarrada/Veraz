export {
  createSupabaseAdminClient,
  isSupabasePersistenceConfigured,
  resetSupabaseAdminClientForTests,
} from "@/lib/supabase/client";
export { SupabaseNotConfiguredError } from "@/lib/supabase/errors";
export type { Database } from "@/lib/supabase/database.types";

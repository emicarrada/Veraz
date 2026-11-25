import { isPostgresPersistenceConfigured, createPostgresPool } from "@/lib/postgres";
import { createSupabaseAdminClient, isSupabasePersistenceConfigured } from "@/lib/supabase";

/** True when this exact URL is already a stored media row. */
export async function isStoredMediaUrl(url: string): Promise<boolean> {
  if (isPostgresPersistenceConfigured()) {
    const result = await createPostgresPool().query("select 1 from media where url = $1 limit 1", [url]);
    return (result.rowCount ?? 0) > 0;
  }

  if (!isSupabasePersistenceConfigured()) return false;

  const { data, error } = await createSupabaseAdminClient()
    .from("media")
    .select("id")
    .eq("url", url)
    .limit(1);

  if (error) return false;
  return (data?.length ?? 0) > 0;
}

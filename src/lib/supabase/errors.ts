export class SupabaseNotConfiguredError extends Error {
  readonly code = "supabase_not_configured" as const;

  constructor(message = "Supabase is not configured.") {
    super(message);
    this.name = "SupabaseNotConfiguredError";
  }
}

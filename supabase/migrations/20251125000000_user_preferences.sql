-- Reader preferences live next to Supabase Auth.
-- A Postgres without auth.users records this migration and creates nothing.

DO $$
BEGIN
  IF to_regclass('auth.users') IS NULL THEN
    RETURN;
  END IF;

  CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    country_codes TEXT[] NOT NULL DEFAULT '{}',
    topic_slugs TEXT[] NOT NULL DEFAULT '{}',
    onboarding_completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS user_preferences_select_own ON public.user_preferences;
  CREATE POLICY user_preferences_select_own
    ON public.user_preferences
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS user_preferences_insert_own ON public.user_preferences;
  CREATE POLICY user_preferences_insert_own
    ON public.user_preferences
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS user_preferences_update_own ON public.user_preferences;
  CREATE POLICY user_preferences_update_own
    ON public.user_preferences
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  REVOKE ALL ON public.user_preferences FROM anon;
  GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;
END $$;

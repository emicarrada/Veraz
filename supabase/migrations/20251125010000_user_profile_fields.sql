-- Profile fields for optional onboarding. Skipped on a Postgres without Supabase Auth.

DO $$
BEGIN
  IF to_regclass('auth.users') IS NULL THEN
    RETURN;
  END IF;

  IF to_regclass('public.user_preferences') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE public.user_preferences
    ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS sex TEXT,
    ADD COLUMN IF NOT EXISTS age SMALLINT,
    ADD COLUMN IF NOT EXISTS email_updates BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

  ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_sex_check;
  ALTER TABLE public.user_preferences
    ADD CONSTRAINT user_preferences_sex_check
    CHECK (sex IS NULL OR sex IN ('female', 'male', 'other', 'undisclosed'));

  ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_age_check;
  ALTER TABLE public.user_preferences
    ADD CONSTRAINT user_preferences_age_check
    CHECK (age IS NULL OR (age >= 16 AND age <= 120));
END $$;

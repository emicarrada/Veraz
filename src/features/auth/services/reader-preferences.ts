import type { SupabaseClient } from "@supabase/supabase-js";

import { getAuthSession } from "@/features/auth/services/get-auth-session";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import type { Database } from "@/lib/supabase/database.types";

import {
  isSexOption,
  parseReaderOnboarding,
  parseReaderPreferences,
  type ReaderOnboardingError,
  type ReaderOnboardingInput,
  type ReaderPreferences,
} from "@/features/auth/preference-options";

type AuthClient = SupabaseClient<Database>;

type PreferenceRow = {
  country_codes: string[] | null;
  topic_slugs: string[] | null;
  first_name: string | null;
  last_name: string | null;
  sex: string | null;
  age: number | null;
  email_updates: boolean | null;
  terms_accepted_at: string | null;
  onboarding_completed_at: string | null;
};

const PREFERENCE_COLUMNS =
  "country_codes, topic_slugs, first_name, last_name, sex, age, email_updates, terms_accepted_at, onboarding_completed_at";

function mapRow(row: PreferenceRow): ReaderPreferences | null {
  const parsed = parseReaderPreferences({
    countryCodes: row.country_codes ?? [],
    topicSlugs: row.topic_slugs ?? [],
  });
  if (!parsed.ok) return null;

  return {
    ...parsed.value,
    onboardingCompletedAt: row.onboarding_completed_at,
    firstName: row.first_name?.trim() ?? "",
    lastName: row.last_name?.trim() ?? "",
    sex: row.sex && isSexOption(row.sex) ? row.sex : null,
    age: typeof row.age === "number" ? row.age : null,
    emailUpdates: Boolean(row.email_updates),
    termsAcceptedAt: row.terms_accepted_at,
  };
}

export async function getReaderPreferences(
  userId: string,
  client?: AuthClient | null,
): Promise<ReaderPreferences | null> {
  try {
    const supabase = client ?? (await createAuthServerClient());
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("user_preferences")
      .select(PREFERENCE_COLUMNS)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return mapRow(data as PreferenceRow);
  } catch {
    return null;
  }
}

export async function getActiveReaderPreferences(): Promise<ReaderPreferences | null> {
  const session = await getAuthSession();
  if (!session) return null;

  const preferences = await getReaderPreferences(session.userId);
  if (!preferences?.onboardingCompletedAt) return null;
  return preferences;
}

export async function saveReaderPreferences(
  input: ReaderOnboardingInput,
): Promise<{ ok: true } | { ok: false; error: ReaderOnboardingError | "unauthorized" | "save_failed" }> {
  const parsed = parseReaderOnboarding(input);
  if (!parsed.ok) return parsed;

  const session = await getAuthSession();
  if (!session) return { ok: false, error: "unauthorized" };

  const supabase = await createAuthServerClient();
  if (!supabase) return { ok: false, error: "save_failed" };

  const now = new Date().toISOString();
  const { data: current } = await supabase
    .from("user_preferences")
    .select("onboarding_completed_at")
    .eq("user_id", session.userId)
    .maybeSingle();

  const completedAt =
    (current as { onboarding_completed_at: string | null } | null)?.onboarding_completed_at ?? now;

  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: session.userId,
      first_name: parsed.value.firstName,
      last_name: parsed.value.lastName,
      sex: parsed.value.sex,
      age: parsed.value.age,
      email_updates: parsed.value.emailUpdates,
      terms_accepted_at: now,
      country_codes: parsed.value.countryCodes,
      topic_slugs: parsed.value.topicSlugs,
      onboarding_completed_at: completedAt,
      updated_at: now,
    },
    { onConflict: "user_id" },
  );

  if (error) return { ok: false, error: "save_failed" };

  await supabase.auth.updateUser({
    data: {
      first_name: parsed.value.firstName,
      last_name: parsed.value.lastName,
      full_name: `${parsed.value.firstName} ${parsed.value.lastName}`,
    },
  });

  return { ok: true };
}
